import path from "path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

function resolveDbPath(url: string): string {
  if (url.startsWith("file:")) return url.slice(5);
  if (path.isAbsolute(url)) return url;
  return path.join(process.cwd(), url);
}

const DB_PATH = resolveDbPath(process.env.DATABASE_URL ?? "data/room.db");

export type DB = BetterSQLite3Database<typeof schema>;

const globalForDb = globalThis as unknown as {
  roomDb?: DB | null;
  roomDbAvailable?: boolean;
};

function createDb(): { db: DB | null; available: boolean } {
  try {
    const sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    return { db: drizzle(sqlite, { schema }), available: true };
  } catch (error) {
    console.error("[db] SQLite unavailable — read-only fallback active:", error);
    return { db: null, available: false };
  }
}

const created =
  globalForDb.roomDb !== undefined
    ? { db: globalForDb.roomDb, available: globalForDb.roomDbAvailable ?? false }
    : createDb();

export const db: DB | null = created.db;
export const dbAvailable: boolean = created.available;

if (process.env.NODE_ENV !== "production") {
  globalForDb.roomDb = created.db;
  globalForDb.roomDbAvailable = created.available;
}

export { schema };