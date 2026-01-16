import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './entities/card.entity';
import { AuthorCard, AuthorCardSchema } from './entities/author.entity';
import {
  AnthologyCard,
  AnthologyCardSchema,
} from './entities/anthology.entity';
import { MagazineCard, MagazineCardSchema } from './entities/magazine.entity';
import { GroupingCard, GroupingCardSchema } from './entities/grouping.entity';
import { AiModule } from '../ai/ai.module';
import {
  MythAndLegendCard,
  MythAndLegendCardSchema,
} from './entities/mythLegend.entity';

@Module({
  controllers: [CardsController],
  providers: [CardsService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Card.name,
        schema: CardSchema,
        discriminators: [
          { name: AuthorCard.name, schema: AuthorCardSchema },
          { name: AnthologyCard.name, schema: AnthologyCardSchema },
          { name: MagazineCard.name, schema: MagazineCardSchema },
          { name: GroupingCard.name, schema: GroupingCardSchema },
          { name: MythAndLegendCard.name, schema: MythAndLegendCardSchema },
        ],
      },
    ]),
    AiModule,
  ],
  exports: [CardsService, MongooseModule],
})
export class CardsModule {}
