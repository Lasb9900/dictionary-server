import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { EnvConfiguration } from './config/env.config';
import { JoiValidationSchema } from './config/joi.validation';

import { CardsModule } from './cards/cards.module';
import { UsersModule } from './users/users.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { AiModule } from './ai/ai.module';
import { DictionaryModule } from './dictionary/dictionary.module';
import { Neo4jModule } from './neo4j/neo4j.module';

@Module({
  imports: [
    /**
     * =========================
     * CONFIG (GLOBAL)
     * =========================
     */
    ConfigModule.forRoot({
      isGlobal: true,
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),

    /**
     * =========================
     * MONGOOSE (Replica Set)
     * =========================
     */
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('mongodbUri');

        if (!uri) {
          throw new Error(
            '❌ MONGODB_URI is not defined. MongoDB connection aborted.',
          );
        }

        return {
          uri,
        };
      },
    }),

    /**
     * =========================
     * DOMAIN MODULES
     * =========================
     */
    UsersModule,        // Auth, JWT, Passport (exporta PassportModule)
    CardsModule,        // Cards (Author, Anthology, etc.)
    IngestionModule,    // AutoFill, AutoReview, AutoUpload
    AiModule,           // Ollama + Gemini providers
    DictionaryModule,   // Chat /ask endpoint

    /**
     * =========================
     * OPTIONAL EXTERNALS
     * =========================
     */
    Neo4jModule.forRootAsync(),
  ],
})
export class AppModule {}
