import path from "path";
import { readFileSync } from "fs";
import Database from "better-sqlite3";

/**
 * Применяет AZ-переводы из data/az-translations.json к БД.
 * Обновляет ТОЛЬКО az-поля (EN не изменяются). Идемпотентен — можно запускать повторно.
 *
 * Запуск: npm run db:translate
 */

interface Translations {
  roles?: Record<string, string>;
  media?: Record<string, string>;
  settings?: { address?: string };
  artists?: Record<string, { bio?: string; statement?: string }>;
  events?: Record<string, { date?: string; description?: string }>;
}

const translations: Translations = JSON.parse(
  readFileSync(path.resolve(process.cwd(), "data", "az-translations.json"), "utf8")
);

const databaseUrl = process.env.DATABASE_URL ?? "data/room.db";
const databasePath = path.resolve(process.cwd(), databaseUrl.replace(/^file:/, ""));
const db = new Database(databasePath);
db.pragma("journal_mode = WAL");

type Localized = { en: string; az: string };

function readLocalized(value: unknown): Localized {
  if (value == null) return { en: "", az: "" };
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") {
        return { en: String((parsed as Localized).en ?? ""), az: String((parsed as Localized).az ?? "") };
      }
    } catch {
      return { en: value, az: "" };
    }
  }
  const obj = value as Partial<Localized>;
  return { en: String(obj.en ?? ""), az: String(obj.az ?? "") };
}

function writeLocalized(col: { table: string; column: string }, rowId: number, current: unknown, az: string): void {
  const loc = readLocalized(current);
  db.prepare(`update ${col.table} set ${col.column} = ? where id = ?`).run(
    JSON.stringify({ en: loc.en, az }),
    rowId
  );
}

let applied = 0;
let missing = 0;

type ArtistRow = { id: number; role: string | null; bio: string | null; statement: string | null; slug: string };
type ArtworkRow = { id: number; medium: string | null };
type EventRow = { id: number; slug: string; date: string | null; description: string | null };
type SettingsRow = { id: number; address: string | null };

// 1. Роли (artists.role) — по значению EN
if (translations.roles) {
  for (const row of db.prepare("select id, role from artists").all() as ArtistRow[]) {
    const en = readLocalized(row.role).en;
    const az = translations.roles[en];
    if (az) {
      writeLocalized({ table: "artists", column: "role" }, row.id, row.role, az);
      applied++;
    } else if (en) {
      console.warn(`MISSING role translation: "${en}"`);
      missing++;
    }
  }
}

// 2. Техники (artworks.medium) — по значению EN
if (translations.media) {
  for (const row of db.prepare("select id, medium from artworks").all() as ArtworkRow[]) {
    const en = readLocalized(row.medium).en;
    const az = translations.media[en];
    if (az) {
      writeLocalized({ table: "artworks", column: "medium" }, row.id, row.medium, az);
      applied++;
    } else if (en) {
      console.warn(`MISSING medium translation: "${en}"`);
      missing++;
    }
  }
}

// 3. Настройки (адрес)
if (translations.settings?.address) {
  for (const row of db.prepare("select id, address from settings").all() as SettingsRow[]) {
    writeLocalized({ table: "settings", column: "address" }, row.id, row.address, translations.settings.address);
    applied++;
  }
}

// 4. Художники (bio, statement) — по slug
if (translations.artists) {
  const update = db.prepare("select id, slug, bio, statement from artists where slug = ?");
  for (const [slug, fields] of Object.entries(translations.artists)) {
    const row = update.get(slug) as ArtistRow | undefined;
    if (!row) {
      console.warn(`MISSING artist slug: ${slug}`);
      missing++;
      continue;
    }
    if (fields.bio) {
      writeLocalized({ table: "artists", column: "bio" }, row.id, row.bio, fields.bio);
      applied++;
    }
    if (fields.statement) {
      writeLocalized({ table: "artists", column: "statement" }, row.id, row.statement, fields.statement);
      applied++;
    }
  }
}

// 5. События (date, description) — по slug
if (translations.events) {
  const update = db.prepare("select id, slug, date, description from events where slug = ?");
  for (const [slug, fields] of Object.entries(translations.events)) {
    const row = update.get(slug) as EventRow | undefined;
    if (!row) {
      console.warn(`MISSING event slug: ${slug}`);
      missing++;
      continue;
    }
    if (fields.date) {
      writeLocalized({ table: "events", column: "date" }, row.id, row.date, fields.date);
      applied++;
    }
    if (fields.description) {
      writeLocalized({ table: "events", column: "description" }, row.id, row.description, fields.description);
      applied++;
    }
  }
}

db.close();
console.log(`AZ translations applied: ${applied} fields, ${missing} missing.`);
if (missing > 0) process.exitCode = 1;