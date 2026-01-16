import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';

@Injectable()
export class AiService {
  constructor(
    private readonly configService: ConfigService,
    private readonly openAiProvider: OpenAiProvider,
    private readonly geminiProvider: GeminiProvider,
  ) {}

  async generateText(prompt: string): Promise<string> {
    const provider = (
      this.configService.get<string>('AI_PROVIDER') || 'gemini'
    ).toLowerCase();

    switch (provider) {
      case 'openai':
        return this.openAiProvider.generateText(prompt);
      case 'gemini':
        return this.geminiProvider.generateText(prompt);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}
