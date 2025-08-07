import { Module, OnModuleInit } from '@nestjs/common';
import Database from './db';
import { queries } from './queries';

interface QueriesStructure {
  [category: string]: {
    [queryName: string]: string;
  };
}

@Module({})
export class DatabaseModule implements OnModuleInit {
  onModuleInit() {
    const flatQueries = this.flattenQueries(queries);
    Database.getInstance(flatQueries);
  }

  private flattenQueries(queries: QueriesStructure): Record<string, string> {
    const flattened: Record<string, string> = {};

    for (const [category, categoryQueries] of Object.entries(queries)) {
      for (const [queryName, queryText] of Object.entries(
        categoryQueries as Record<string, string>,
      )) {
        flattened[`${category}.${queryName}`] = queryText;
        flattened[queryName] = queryText;
      }
    }

    return flattened;
  }
}
