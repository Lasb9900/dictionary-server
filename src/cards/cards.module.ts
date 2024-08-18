import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Card, CardSchema } from './entities/card.entity';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';
import { UserSchema } from '../users/entities/user.entity';

@Module({
  controllers: [CardsController],
  providers: [CardsService],
  imports: [
    MongooseModule.forFeature([
      { name: Card.name, schema: CardSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UsersModule,
  ],
})
export class CardsModule {}
