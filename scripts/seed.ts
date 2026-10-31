import path from "path";
import { readFileSync, mkdirSync } from "fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "../src/db/schema";
import { toLocalizedText } from "../src/lib/i18n/config";

// Safety guard: this script WIPES the target database and rebuilds it from
// data/site-data.json. Never let it run against the production server by accident.
const isProduction = process.env.NODE_ENV === "production";
if (isProduction || !process.argv.includes("--force")) {
  console.error(
    "db:seed REPLACES ALL DATA in the database with data/site-data.json.\n" +
      (isProduction
        ? "Refusing to run with NODE_ENV=production."
        : "Re-run with an explicit flag if you really mean it: npm run db:seed -- --force")
  );
  process.exit(1);
}

/** Локализуемые поля пишем в колонки как JSON {en,az}; plain string тоже ок. */
const loc = (value: unknown) => JSON.stringify(toLocalizedText(value));

type Localizable = string | { en: string; az: string };

type JsonSettings = {
  whatsappNumber: string;
  email: string;
  phone: string;
  address: Localizable;
  instagram: string;
};

type JsonAbout = {
  concept: Localizable;
  vision: Localizable;
  identity: Localizable;
};

type JsonArtist = {
  slug: string;
  name: string;
  role: Localizable;
  portrait: string;
  photos?: string[];
  bio: Localizable;
  statement: Localizable;
};

type JsonArtwork = {
  slug: string;
  title: string;
  artistSlug: string;
  year: string;
  medium: Localizable;
  dimensions: string;
  widthCm: number;
  heightCm: number;
  image: string;
  availability: string;
  description?: Localizable;
  priceAzn?: number | null;
  displayed: boolean;
  tondo?: boolean;
};

type JsonEvent = {
  slug: string;
  title: string;
  status: string;
  date: Localizable;
  image: string;
  heroTransform: string;
  thumbTransform: string;
  detailTransform: string;
  featured: boolean;
  description: Localizable;
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

  tx.insert(schema.settings)
    .values({
      id: 1,
      whatsappNumber: siteData.settings.whatsappNumber,
      email: siteData.settings.email,
      phone: siteData.settings.phone,
      address: loc(siteData.settings.address),
      instagram: siteData.settings.instagram,
    })
    .run();
  tx.insert(schema.about)
    .values({
      id: 1,
      concept: loc(siteData.about.concept),
      vision: loc(siteData.about.vision),
      identity: loc(siteData.about.identity),
    })
    .run();

  for (const artist of siteData.artists) {
    tx.insert(schema.artists).values({
      slug: artist.slug,
      name: artist.name,
      role: loc(artist.role),
      portrait: artist.portrait,
      photos: JSON.stringify(artist.photos ?? []),
      bio: loc(artist.bio),
      statement: loc(artist.statement),
    }).run();
  }

  for (const artwork of siteData.artworks) {
    tx.insert(schema.artworks)
      .values({
        slug: artwork.slug,
        title: artwork.title,
        artistSlug: artwork.artistSlug,
        year: artwork.year,
        medium: loc(artwork.medium),
        dimensions: artwork.dimensions,
        widthCm: artwork.widthCm,
        heightCm: artwork.heightCm,
        image: artwork.image,
        availability: artwork.availability,
        description: loc(artwork.description ?? ""),
        priceAzn: artwork.priceAzn ?? null,
        displayed: artwork.displayed,
        tondo: artwork.tondo ?? false,
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
        date: loc(event.date),
        image: event.image,
        heroTransform: event.heroTransform,
        thumbTransform: event.thumbTransform,
        detailTransform: event.detailTransform,
        featured: event.featured,
        description: loc(event.description),
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