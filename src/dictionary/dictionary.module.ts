import { Module } from '@nestjs/common';
import { DictionaryController } from './dictionary.controller';
import { DictionaryService } from './dictionary.service';
import { AiModule } from '../ai/ai.module';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [AiModule, CardsModule],
  controllers: [DictionaryController],
  providers: [DictionaryService],
})
export class DictionaryModule {}
