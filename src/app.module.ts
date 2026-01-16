import { Module } from '@nestjs/common';
import { CardsModule } from './cards/cards.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { EnvConfiguration } from './config/env.config';
import { JoiValidationSchema } from './config/joi.validation';
import { Neo4jModule } from './neo4j/neo4j.module';
import { AiModule } from './ai/ai.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { HealthModule } from './health/health.module';
import { DictionaryModule } from './dictionary/dictionary.module';

@Module({
  imports: (() => {
    const imports = [
      ConfigModule.forRoot({
        load: [EnvConfiguration],
        validationSchema: JoiValidationSchema,
      }),
      MongooseModule.forRoot(process.env.MONGODB_URI),
      CardsModule,
      UsersModule,
      AiModule,
      IngestionModule,
      DictionaryModule,
    ];

    if (process.env.NEO4J_ENABLED === 'true') {
      imports.push(Neo4jModule.forRootAsync());
    }

    if (process.env.HEALTH_ENABLED === 'true') {
      imports.push(HealthModule);
    }

    return imports;
  })(),
})
export class AppModule {}
