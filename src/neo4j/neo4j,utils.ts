import { ConfigService } from '@nestjs/config';
import { Neo4jConfig } from './neo4j-config.interface';

export const createDatabaseConfig = (
  configService: ConfigService,
  customConfig?: Neo4jConfig,
): Neo4jConfig =>
  customConfig || {
    uri: configService.get('NEO4J_URI'),
    password: configService.get('NEO4J_PASSWORD'),
    username: configService.get('NEO4J_USERNAME'),
  };

export class ConnecitonError extends Error {
  public details: string;
  constructor(oldError: Error) {
    super();
    this.message = 'Connection with Neo4j database was not established';
    this.name = 'Connection Error';
    this.stack = oldError.stack;
    this.details = oldError.message;
  }
}
