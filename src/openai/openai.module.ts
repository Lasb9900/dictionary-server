import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Module({
  imports: [ConfigModule],
  providers: [
    OpenaiService,
    {
      provide: OpenAI,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get('OPENAI_API_KEY');
        return new OpenAI(apiKey);
      },
      inject: [ConfigService],
    },
  ],
  exports: [OpenaiService],
})
export class OpenaiModule {}
