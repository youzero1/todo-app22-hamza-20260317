import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Todo } from '@/entities/Todo';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './data/todos.db';

// Ensure the data directory exists
const dbDir = path.dirname(path.resolve(dbPath));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dataSource: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (dataSource && dataSource.isInitialized) {
    return dataSource;
  }

  dataSource = new DataSource({
    type: 'better-sqlite3',
    database: path.resolve(dbPath),
    entities: [Todo],
    synchronize: true,
    logging: process.env.NODE_ENV === 'development',
  });

  await dataSource.initialize();
  return dataSource;
}
