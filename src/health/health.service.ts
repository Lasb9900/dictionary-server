import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { QueryRepository } from '../neo4j/query.repository';

type DependencyStatus = 'up' | 'down' | 'configured' | 'not_configured';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    private readonly queryRepository: QueryRepository,
    private readonly configService: ConfigService,
  ) {}

  async checkHealth() {
    const mongo = await this.checkMongo();
    const neo4j = await this.checkNeo4j();
    const openai = this.checkOpenAi();

    const isHealthy =
      mongo === 'up' && neo4j === 'up' && openai === 'configured';

    return {
      status: isHealthy ? 'ok' : 'degraded',
      mongo,
      neo4j,
      openai,
    };
  }

  private async checkMongo(): Promise<DependencyStatus> {
    try {
      await this.mongoConnection.db.admin().ping();
      return 'up';
    } catch (error) {
      this.logger.warn('Mongo health check failed');
      return 'down';
    }
  }

  private async checkNeo4j(): Promise<DependencyStatus> {
    try {
      await this.queryRepository.initQuery().raw('RETURN 1').run();
      return 'up';
    } catch (error) {
      this.logger.warn('Neo4j health check failed');
      return 'down';
    }
  }

  private checkOpenAi(): DependencyStatus {
    const apiKey =
      this.configService.get<string>('OPENAI_API_KEY') ||
      process.env.OPENAI_API_KEY;

    return apiKey ? 'configured' : 'not_configured';
  }
}
