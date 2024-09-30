import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

const model = 'gpt-3.5';
const temperature = 0;

@Injectable()
export class OpenaiService {
  constructor(private readonly openai: OpenAI) {}

  async generateText(prompt: string, object: string): Promise<string> {
    const chatCompletion = await this.openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: object },
      ],
      temperature,
    });
    return chatCompletion.choices[0].message.content;
  }
}
