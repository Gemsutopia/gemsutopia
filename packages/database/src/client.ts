import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon, NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type DbInstance = NeonHttpDatabase<typeof schema>;

// Lazy-initialized database instance (prevents build-time connection)
let _db: DbInstance | null = null;

// Get the database instance (lazy initialization)
export function getDb(): DbInstance {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const sql = neon(url);
  _db = drizzleNeon(sql, { schema });

  return _db;
}

// For backwards compatibility - use getDb() for lazy init
export const db = new Proxy({} as DbInstance, {
  get(_target, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Type exports
export type Database = DbInstance;
