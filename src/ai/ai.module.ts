import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AI_PROVIDERS } from './ai.constants';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiProvider } from './providers/gemini.provider';
import { OllamaProvider } from './providers/ollama.provider';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    GeminiProvider,
    OllamaProvider,
    {
      provide: AI_PROVIDERS,
      useFactory: (geminiProvider: GeminiProvider, ollamaProvider: OllamaProvider) => [
        geminiProvider,
        ollamaProvider,
      ],
      inject: [GeminiProvider, OllamaProvider],
    },
  ],
  imports: [ConfigModule],
  exports: [AiService],
})
export class AiModule {}
