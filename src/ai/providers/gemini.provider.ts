import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TextGenerationProvider } from '../ai.interfaces';

const model = 'gemini-1.5-flash';
const temperature = 0.1;

@Injectable()
export class GeminiProvider implements TextGenerationProvider {
  constructor(private readonly configService: ConfigService) {}

  async generateText(prompt: string): Promise<string> {
    const apiKey =
      this.configService.get<string>('GEMINI_API_KEY') ||
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const client = new GoogleGenerativeAI(apiKey);
    const generativeModel = client.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
      },
    });

    const result = await generativeModel.generateContent(prompt);
    return result.response.text();
  }
}
