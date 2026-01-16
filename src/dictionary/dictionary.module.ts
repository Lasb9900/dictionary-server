import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiModule } from '../ai/ai.module';
import { DictionaryController } from './dictionary.controller';
import { DictionaryService } from './dictionary.service';
import {
  DictionaryEntry,
  DictionaryEntrySchema,
} from './entities/dictionary-entry.entity';

@Module({
  imports: [
    AiModule,
    MongooseModule.forFeature([
      { name: DictionaryEntry.name, schema: DictionaryEntrySchema },
    ]),
  ],
  controllers: [DictionaryController],
  providers: [DictionaryService],
})
export class DictionaryModule {}
