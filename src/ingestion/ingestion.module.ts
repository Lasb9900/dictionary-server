import { Module } from '@nestjs/common';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { CardReadinessService } from './services/card-readiness.service';
import { CardsModule } from '../cards/cards.module';

@Module({
  imports: [CardsModule],
  controllers: [IngestionController],
  providers: [IngestionService, CardReadinessService],
})
export class IngestionModule {}
