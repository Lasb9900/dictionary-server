import { Module } from '@nestjs/common';
import { CardsModule } from './cards/cards.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectiveWorksModule } from './collective-works/collective-works.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/dict-db'),
    CardsModule,
    CollectiveWorksModule,
  ],
})
export class AppModule {}
