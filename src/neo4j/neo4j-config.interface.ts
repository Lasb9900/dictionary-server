import { Connection } from 'cypher-query-builder';
import { Driver } from 'neo4j-driver';

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
}

export type ConnectionWithDriver = Connection & {
  driver: Driver;
};
