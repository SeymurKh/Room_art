import type { z } from "zod";
import type {
  artistSchema,
  artworkSchema,
  eventSchema,
  siteDataSchema,
} from "./site-data-schema";

export type Artist = z.infer<typeof artistSchema>;
export type Artwork = z.infer<typeof artworkSchema>;
export type Event = z.infer<typeof eventSchema>;

// SiteSettings and AboutContent are derived from the composite schema's shape.
export type SiteSettings = z.infer<typeof siteDataSchema>["settings"];
export type AboutContent = z.infer<typeof siteDataSchema>["about"];

export type SiteData = z.infer<typeof siteDataSchema>;