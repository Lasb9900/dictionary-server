import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiGenerateInput, AiProvider } from '../interfaces/ai-provider.interface';

@Injectable()
export class GeminiProvider implements AiProvider {
  name: 'gemini' = 'gemini';

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    return Boolean(this.configService.get<string>('geminiApiKey'));
  }

  async generateText(input: AiGenerateInput): Promise<string> {
    const apiKey = this.configService.get<string>('geminiApiKey');
    if (!apiKey) {
      throw new BadRequestException('GEMINI_API_KEY is not configured.');
    }

    const model =
      input.model ?? this.configService.get<string>('geminiModel') ?? 'gemini-1.5-flash';
    const temperature =
      input.temperature ??
      this.configService.get<number>('aiTemperature') ??
      0;

    const promptParts = input.input
      ? [{ text: input.prompt }, { text: input.input }]
      : [{ text: input.prompt }];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: promptParts,
            },
          ],
          generationConfig: {
            temperature,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new BadRequestException(
        `Gemini request failed (${response.status}): ${errorText}`,
      );
    }

    const payload = await response.json();
    const candidate = payload?.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text;
    if (!content) {
      throw new BadRequestException('Gemini response did not include text.');
    }

    return content;
  }
}
