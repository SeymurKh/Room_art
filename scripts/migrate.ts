import path from "path";
import { mkdirSync } from "fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { loadEnvConfig } from "@next/env";
import * as schema from "../src/db/schema";

loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL ?? "data/room.db";
const databasePath = path.resolve(
  process.cwd(),
  databaseUrl.replace(/^file:/, "")
);

mkdirSync(path.dirname(databasePath), { recursive: true });

const sqlite = new Database(databasePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

try {
  migrate(drizzle(sqlite, { schema }), { migrationsFolder: "./drizzle" });
  console.log(`Database migrations applied to ${databasePath}`);
} finally {
  sqlite.close();
}
