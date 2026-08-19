import path from "path";
import { readFileSync, mkdirSync } from "fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../src/db/schema";

type JsonSettings = {
  whatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  instagram: string;
  facebook: string;
};

type JsonAbout = {
  concept: string;
  vision: string;
  identity: string;
};

type JsonArtist = {
  slug: string;
  name: string;
  role: string;
  portrait: string;
  bio: string;
  statement: string;
};

type JsonArtwork = {
  slug: string;
  title: string;
  artistSlug: string;
  year: string;
  medium: string;
  dimensions: string;
  widthCm: number;
  heightCm: number;
  image: string;
  availability: string;
  description?: string;
  price?: string;
  displayed: boolean;
};

type JsonEvent = {
  slug: string;
  title: string;
  status: string;
  date: string;
  image: string;
  heroTransform: string;
  thumbTransform: string;
  detailTransform: string;
  featured: boolean;
  description: string;
  gallery?: string[];
  video?: string;
};

type JsonSiteData = {
  settings: JsonSettings;
  about: JsonAbout;
  artists: JsonArtist[];
  artworks: JsonArtwork[];
  events: JsonEvent[];
};

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.DATABASE_URL?.replace(/^file:/, "") ?? "data/room.db"
);

mkdirSync(path.dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

const db = drizzle(sqlite, { schema });

migrate(db, { migrationsFolder: "./drizzle" });

const raw = readFileSync(
  path.resolve(process.cwd(), "data", "site-data.json"),
  "utf8"
);
const siteData = JSON.parse(raw) as JsonSiteData;

db.transaction((tx) => {
  tx.delete(schema.eventsMedia).run();
  tx.delete(schema.events).run();
  tx.delete(schema.artworks).run();
  tx.delete(schema.artists).run();
  tx.delete(schema.settings).run();
  tx.delete(schema.about).run();

  tx.insert(schema.settings).values({ id: 1, ...siteData.settings }).run();
  tx.insert(schema.about).values({ id: 1, ...siteData.about }).run();

  for (const artist of siteData.artists) {
    tx.insert(schema.artists).values(artist).run();
  }

  for (const artwork of siteData.artworks) {
    tx.insert(schema.artworks)
      .values({
        slug: artwork.slug,
        title: artwork.title,
        artistSlug: artwork.artistSlug,
        year: artwork.year,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        widthCm: artwork.widthCm,
        heightCm: artwork.heightCm,
        image: artwork.image,
        availability: artwork.availability,
        description: artwork.description ?? "",
        price: artwork.price ?? "",
        displayed: artwork.displayed,
      })
      .run();
  }

  for (const event of siteData.events) {
    const gallery = event.gallery ?? [];
    const video = event.video ?? "";
    const inserted = tx
      .insert(schema.events)
      .values({
        slug: event.slug,
        title: event.title,
        status: event.status,
        date: event.date,
        image: event.image,
        heroTransform: event.heroTransform,
        thumbTransform: event.thumbTransform,
        detailTransform: event.detailTransform,
        featured: event.featured,
        description: event.description,
        video,
      })
      .returning({ id: schema.events.id })
      .get();

    gallery.forEach((url, pos) => {
      tx.insert(schema.eventsMedia)
        .values({ eventId: inserted.id, url, pos })
        .run();
    });
  }
});

console.log(`Seeded SQLite database at ${DB_PATH}`);