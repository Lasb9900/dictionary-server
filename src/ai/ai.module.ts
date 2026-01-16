import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { OllamaProvider } from './providers/ollama.provider';

@Module({
  imports: [ConfigModule],
  providers: [AiService, GeminiProvider, OpenAiProvider, OllamaProvider],
  exports: [AiService],
})
export class AiModule {}
