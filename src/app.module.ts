import { Module } from '@nestjs/common';
import { CardsModule } from './cards/cards.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from './config/env.config';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    CardsModule,
    CommonModule,
    UsersModule,
  ],
})
export class AppModule {}
