import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  whatsappNumber: text("whatsapp_number").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  facebook: text("facebook").notNull().default(""),
});

export const about = sqliteTable("about", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  concept: text("concept").notNull().default(""),
  vision: text("vision").notNull().default(""),
  identity: text("identity").notNull().default(""),
});

export const artists = sqliteTable("artists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  portrait: text("portrait").notNull().default(""),
  bio: text("bio").notNull(),
  statement: text("statement").notNull(),
});

export const artworks = sqliteTable("artworks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  artistSlug: text("artist_slug").notNull(),
  year: text("year").notNull(),
  medium: text("medium").notNull(),
  dimensions: text("dimensions").notNull(),
  widthCm: integer("width_cm").notNull(),
  heightCm: integer("height_cm").notNull(),
  image: text("image").notNull(),
  availability: text("availability").notNull(),
  description: text("description").notNull().default(""),
  priceAzn: integer("price_azn"),
  displayed: integer("displayed", { mode: "boolean" }).notNull().default(false),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  status: text("status").notNull(),
  date: text("date").notNull().default(""),
  image: text("image").notNull().default(""),
  heroTransform: text("hero_transform")
    .notNull()
    .default("translate(0px, 0px) scale(1)"),
  thumbTransform: text("thumb_transform")
    .notNull()
    .default("translate(0px, 0px) scale(1)"),
  detailTransform: text("detail_transform")
    .notNull()
    .default("translate(0px, 0px) scale(1)"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  description: text("description").notNull().default(""),
  video: text("video").notNull().default(""),
});

export const eventsMedia = sqliteTable("events_media", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  pos: integer("pos").notNull().default(0),
});