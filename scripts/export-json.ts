import path from "path";
import { mkdirSync, writeFileSync } from "fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { asc } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { siteDataSchema } from "../src/lib/site-data-schema";

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.DATABASE_URL?.replace(/^file:/, "") ?? "data/room.db"
);

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

const [settingsRow] = db.select().from(schema.settings).limit(1).all();
const [aboutRow] = db.select().from(schema.about).limit(1).all();
const artistRows = db.select().from(schema.artists).all();
const artworkRows = db.select().from(schema.artworks).all();
const eventRows = db.select().from(schema.events).all();
const mediaRows = db
  .select()
  .from(schema.eventsMedia)
  .orderBy(asc(schema.eventsMedia.pos), asc(schema.eventsMedia.id))
  .all();

const galleryByEvent = new Map<number, string[]>();
for (const media of mediaRows) {
  const list = galleryByEvent.get(media.eventId) ?? [];
  list.push(media.url);
  galleryByEvent.set(media.eventId, list);
}

const siteData = {
  settings: settingsRow
    ? {
        whatsappNumber: settingsRow.whatsappNumber,
        email: settingsRow.email,
        phone: settingsRow.phone,
        address: settingsRow.address,
        instagram: settingsRow.instagram,
        facebook: settingsRow.facebook,
      }
    : {
        whatsappNumber: "",
        email: "",
        phone: "",
        address: "",
        instagram: "https://instagram.com/roombaku",
        facebook: "https://facebook.com/roombaku",
      },
  artists: artistRows.map((row) => ({
    slug: row.slug,
    name: row.name,
    role: row.role,
    portrait: row.portrait,
    bio: row.bio,
    statement: row.statement,
  })),
  artworks: artworkRows.map((row) => ({
    slug: row.slug,
    title: row.title,
    artistSlug: row.artistSlug,
    year: row.year,
    medium: row.medium,
    dimensions: row.dimensions,
    widthCm: row.widthCm,
    heightCm: row.heightCm,
    image: row.image,
    availability: row.availability,
    description: row.description,
    price: row.price,
    displayed: row.displayed,
  })),
  events: eventRows.map((row) => ({
    slug: row.slug,
    title: row.title,
    status: row.status,
    date: row.date,
    image: row.image,
    heroTransform: row.heroTransform,
    thumbTransform: row.thumbTransform,
    detailTransform: row.detailTransform,
    featured: row.featured,
    description: row.description,
    gallery: galleryByEvent.get(row.id) ?? [],
    video: row.video || undefined,
  })),
  about: aboutRow
    ? {
        concept: aboutRow.concept,
        vision: aboutRow.vision,
        identity: aboutRow.identity,
      }
    : { concept: "", vision: "", identity: "" },
};

// Validate before writing so the snapshot always matches the public schema.
const validated = siteDataSchema.parse(siteData);

const outFile = path.resolve(process.cwd(), "data", "site-data.json");
mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(validated, null, 2) + "\n", "utf8");

console.log(`Exported ${validated.artists.length} artists, ${validated.artworks.length} artworks, ${validated.events.length} events to ${outFile}`);