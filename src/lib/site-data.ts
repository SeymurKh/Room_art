import { readFileSync } from "fs";
import path from "path";
import { asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import {
  settings as settingsTable,
  about as aboutTable,
  artists as artistsTable,
  artworks as artworksTable,
  events as eventsTable,
  eventsMedia,
} from "@/db/schema";
import { siteDataSchema } from "@/lib/site-data-schema";
import { defaultSiteData } from "@/data/defaultSiteData";
import { isReadOnlyMode } from "@/lib/env";
import type {
  SiteData,
  Event,
  Artist,
  Artwork,
  SiteSettings,
  AboutContent,
} from "@/lib/types";

const dataFile = path.join(process.cwd(), "data", "site-data.json");

function readJsonSiteData(): SiteData {
  const raw = readFileSync(dataFile, "utf8");
  const parsed = JSON.parse(raw);
  const validated = siteDataSchema.parse(parsed);
  return validated as SiteData;
}

function mapSettings(
  row: (typeof settingsTable.$inferSelect) | undefined
): SiteSettings {
  if (!row) return defaultSiteData.settings;
  return {
    whatsappNumber: row.whatsappNumber,
    email: row.email,
    phone: row.phone,
    address: row.address,
    instagram: row.instagram,
    facebook: row.facebook,
  };
}

function mapAbout(row: (typeof aboutTable.$inferSelect) | undefined): AboutContent {
  if (!row) return defaultSiteData.about;
  return {
    concept: row.concept,
    vision: row.vision,
    identity: row.identity,
  };
}

export async function getSiteData(): Promise<SiteData> {
  // Read-only deploys (Vercel demo) or missing SQLite → read the committed JSON snapshot.
  if (isReadOnlyMode() || !db) return readJsonSiteData();

  const [settingsRow] = db.select().from(settingsTable).limit(1).all();
  const [aboutRow] = db.select().from(aboutTable).limit(1).all();
  const artistRows = db.select().from(artistsTable).all();
  const artworkRows = db.select().from(artworksTable).all();
  const eventRows = db.select().from(eventsTable).all();
  const mediaRows = db
    .select()
    .from(eventsMedia)
    .orderBy(asc(eventsMedia.pos), asc(eventsMedia.id))
    .all();

  // Fresh/empty DB — return the seeded defaults.
  if (!settingsRow && artistRows.length === 0 && eventRows.length === 0) {
    return defaultSiteData;
  }

  const galleryByEvent = new Map<number, string[]>();
  for (const media of mediaRows) {
    const list = galleryByEvent.get(media.eventId) ?? [];
    list.push(media.url);
    galleryByEvent.set(media.eventId, list);
  }

  const artists: Artist[] = artistRows.map((row) => ({
    slug: row.slug,
    name: row.name,
    role: row.role,
    portrait: row.portrait,
    bio: row.bio,
    statement: row.statement,
  }));

  const artworks: Artwork[] = artworkRows.map((row) => ({
    slug: row.slug,
    title: row.title,
    artistSlug: row.artistSlug,
    year: row.year,
    medium: row.medium,
    dimensions: row.dimensions,
    widthCm: row.widthCm,
    heightCm: row.heightCm,
    image: row.image,
    availability: row.availability as Artwork["availability"],
    description: row.description,
    priceAzn: row.priceAzn ?? null,
    displayed: row.displayed,
    tondo: row.tondo,
  }));

  const events: Event[] = eventRows.map((row) => ({
    slug: row.slug,
    title: row.title,
    status: row.status as Event["status"],
    date: row.date,
    image: row.image,
    heroTransform: row.heroTransform,
    thumbTransform: row.thumbTransform,
    detailTransform: row.detailTransform,
    featured: row.featured,
    description: row.description,
    gallery: galleryByEvent.get(row.id) ?? [],
    video: row.video || undefined,
  }));

  return {
    settings: mapSettings(settingsRow),
    artists,
    artworks,
    events,
    about: mapAbout(aboutRow),
  };
}

export class SiteDataValidationError extends Error {
  public issues: string[];
  constructor(issues: string[]) {
    super("Invalid site data");
    this.name = "SiteDataValidationError";
    this.issues = issues;
  }
}

export async function saveSiteData(data: unknown) {
  if (isReadOnlyMode() || !db) {
    throw new SiteDataValidationError([
      "Database is unavailable. Writes are disabled.",
    ]);
  }
  const result = siteDataSchema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`
    );
    throw new SiteDataValidationError(issues);
  }
  const parsed = result.data;

  db.transaction((tx) => {
    // Order matters: events_media references events (cascade), so clear it first.
    tx.delete(eventsMedia).run();
    tx.delete(eventsTable).run();
    tx.delete(artworksTable).run();
    tx.delete(artistsTable).run();
    tx.delete(settingsTable).run();
    tx.delete(aboutTable).run();

    tx.insert(settingsTable)
      .values({ id: 1, ...parsed.settings })
      .run();

    tx.insert(aboutTable)
      .values({ id: 1, ...parsed.about })
      .run();

    for (const artist of parsed.artists) {
      tx.insert(artistsTable).values(artist).run();
    }

    for (const artwork of parsed.artworks) {
      tx.insert(artworksTable)
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
          priceAzn: artwork.priceAzn ?? null,
          displayed: artwork.displayed,
          tondo: artwork.tondo ?? false,
        })
        .run();
    }

    for (const event of parsed.events) {
      const inserted = tx
        .insert(eventsTable)
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
          video: event.video ?? "",
        })
        .returning({ id: eventsTable.id })
        .get();

      const gallery = event.gallery ?? [];
      gallery.forEach((url, pos) => {
        tx.insert(eventsMedia)
          .values({ eventId: inserted.id, url, pos })
          .run();
      });
    }
  });

  revalidatePath("/", "layout");
  revalidatePath("/events");
  revalidatePath("/events/[slug]", "page");
}

