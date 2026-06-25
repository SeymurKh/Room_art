import { z } from "zod";

const localeSchema = z.enum(["en", "az", "ru"]);

const siteSettingsSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  locale: localeSchema,
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  instagram: z.string().url("Instagram must be a valid URL"),
  facebook: z.string().url("Facebook must be a valid URL"),
});

const homeContentSchema = z.object({
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  intro: z.string().min(1),
  heroImage: z.string().min(1),
  currentExhibitionSlug: z.string().min(1),
});

const artistSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  portrait: z.string().min(1),
  bio: z.string().min(1),
  statement: z.string().min(1),
});

const artworkSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  artistSlug: z.string().min(1),
  year: z.string().min(1),
  medium: z.string().min(1),
  category: z.string().min(1),
  dimensions: z.string().min(1),
  image: z.string().min(1),
  availability: z.enum(["Available", "Reserved", "Private collection"]),
  description: z.string().min(1),
});

const exhibitionSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["Exhibition", "Event"]),
  status: z.enum(["Upcoming", "Past"]),
  date: z.string().min(1),
  image: z.string().min(1),
  description: z.string().min(1),
});

const aboutContentSchema = z.object({
  concept: z.string().min(1),
  vision: z.string().min(1),
  identity: z.string().min(1),
  image: z.string().min(1),
});

export const siteDataSchema = z.object({
  settings: siteSettingsSchema,
  home: homeContentSchema,
  artists: z.array(artistSchema),
  artworks: z.array(artworkSchema),
  exhibitions: z.array(exhibitionSchema),
  about: aboutContentSchema,
});

export type SiteDataValidated = z.infer<typeof siteDataSchema>;