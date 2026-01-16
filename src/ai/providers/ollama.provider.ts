import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TextGenerationProvider } from '../ai.interfaces';

@Injectable()
export class OllamaProvider implements TextGenerationProvider {
  constructor(private readonly configService: ConfigService) {}

  async generateText(prompt: string): Promise<string> {
    const baseUrl =
      this.configService.get<string>('OLLAMA_BASE_URL') ||
      process.env.OLLAMA_BASE_URL ||
      'http://localhost:11434';
    const model =
      this.configService.get<string>('OLLAMA_MODEL') ||
      process.env.OLLAMA_MODEL ||
      'llama3.2:3b';
    const temperatureValue =
      this.configService.get<number>('OLLAMA_TEMPERATURE') ??
      (process.env.OLLAMA_TEMPERATURE
        ? Number(process.env.OLLAMA_TEMPERATURE)
        : 0.2);
    const temperature = Number.isFinite(temperatureValue)
      ? temperatureValue
      : 0.2;

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const payload = await response.json();
    return payload.response ?? '';
  }
}
