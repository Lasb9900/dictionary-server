import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { TextGenerationProvider } from '../ai.interfaces';

const model = 'gpt-3.5-turbo';
const temperature = 0;

@Injectable()
export class OpenAiProvider implements TextGenerationProvider {
  constructor(private readonly configService: ConfigService) {}

  async generateText(prompt: string): Promise<string> {
    const apiKey =
      this.configService.get<string>('OPENAI_API_KEY') ||
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const client = new OpenAI({ apiKey });
    const chatCompletion = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
    });

    return chatCompletion.choices[0].message.content ?? '';
  }
}
