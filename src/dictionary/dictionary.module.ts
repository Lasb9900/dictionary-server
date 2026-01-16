import { Module } from '@nestjs/common';
import { DictionaryController } from './dictionary.controller';
import { DictionaryService } from './dictionary.service';
import { AiModule } from '../ai/ai.module';

@Module({
  controllers: [DictionaryController],
  providers: [DictionaryService],
  imports: [AiModule],
})
export class DictionaryModule {}
