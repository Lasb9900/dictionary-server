import { Module } from '@nestjs/common';
import { CollectiveWorksService } from './collective-works.service';
import { CollectiveWorksController } from './collective-works.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CollectiveWorkSchema,
  CollectiveWorks,
} from './entities/collective-works.entity';
import { Anthology, AnthologySchema } from './entities/anthology.entity';
import { Grouping, GroupingSchema } from './entities/grouping.entity';
import { Magazine, MagazineSchema } from './entities/magazine.entity';

@Module({
  controllers: [CollectiveWorksController],
  providers: [CollectiveWorksService],
  imports: [
    MongooseModule.forFeature([
      {
        name: CollectiveWorks.name,
        schema: CollectiveWorkSchema,
        discriminators: [
          { name: Grouping.name, schema: GroupingSchema },
          { name: Anthology.name, schema: AnthologySchema },
          { name: Magazine.name, schema: MagazineSchema },
        ],
      },
    ]),
  ],
})
export class CollectiveWorksModule {}
