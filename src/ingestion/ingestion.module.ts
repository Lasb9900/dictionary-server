import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { CardReadinessService } from './services/card-readiness.service';
import { CardsModule } from '../cards/cards.module';
import { AiModule } from '../ai/ai.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [CardsModule, AiModule, ConfigModule],
  controllers: [IngestionController],
  providers: [IngestionService, CardReadinessService],
})
export class IngestionModule {}
