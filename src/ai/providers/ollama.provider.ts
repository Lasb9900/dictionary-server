import {
  BadGatewayException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiGenerateInput, AiProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class OllamaProvider implements AiProvider {
  name: 'ollama' = 'ollama';

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.configService.get<string>('ollamaBaseUrl'));
  }

  async isReachable(): Promise<boolean> {
    const baseUrl = this.configService.get<string>('ollamaBaseUrl');
    if (!baseUrl) {
      return false;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(`${baseUrl}/api/version`, {
        method: 'GET',
        signal: controller.signal,
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateText(input: AiGenerateInput): Promise<string> {
    const baseUrl = this.configService.get<string>('ollamaBaseUrl');
    if (!baseUrl) {
      throw new ServiceUnavailableException(
        'OLLAMA_BASE_URL is not configured.',
      );
    }

    const model =
      input.model ?? this.configService.get<string>('ollamaModel') ?? 'llama3.1';
    const temperature =
      input.temperature ??
      this.configService.get<number>('aiTemperature') ??
      0;

    const fullPrompt = input.input
      ? `${input.prompt}\n\n${input.input}`
      : input.prompt;

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadGatewayException(
        `Ollama request failed (${response.status}): ${errorText}`,
      );
    }

    const payload = await response.json();
    if (!payload?.response) {
      throw new BadGatewayException('Ollama response did not include text.');
    }

    return payload.response;
  }
}
