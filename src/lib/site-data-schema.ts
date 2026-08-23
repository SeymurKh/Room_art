import { z } from "zod";

const siteSettingsSchema = z.object({
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  instagram: z.string().url("Instagram must be a valid URL"),
  facebook: z.string().url("Facebook must be a valid URL"),
});

const artistSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  portrait: z.string().default(""),
  photos: z.array(z.string()).default([]),
  bio: z.string().default(""),
  statement: z.string().default(""),
});

const artworkSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  artistSlug: z.string().min(1),
  year: z.string().default(""),
  medium: z.string().min(1),
  dimensions: z.string().min(1),
  widthCm: z.number().positive(),
  heightCm: z.number().positive(),
  image: z.string().min(1),
  availability: z.enum(["Available", "Reserved", "Private collection"]),
  description: z.string().default(""),
  priceAzn: z.number().nullable().default(null),
  displayed: z.boolean().default(false),
  tondo: z.boolean().default(false),
});

const eventSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(["Upcoming", "Current", "Past"]),
  date: z.string().min(1, "Date is required"),
  image: z.string(),
  heroTransform: z.string().default("translate(0px, 0px) scale(1)"),
  thumbTransform: z.string().default("translate(0px, 0px) scale(1)"),
  detailTransform: z.string().default("translate(0px, 0px) scale(1)"),
  featured: z.boolean().default(false),
  description: z.string(),
  gallery: z.array(z.string()).default([]),
  video: z.string().default(""),
});

const aboutContentSchema = z.object({
  concept: z.string().min(1),
  vision: z.string().min(1),
  identity: z.string().min(1),
});

export const siteDataSchema = z.object({
  settings: siteSettingsSchema,
  artists: z.array(artistSchema),
  artworks: z.array(artworkSchema),
  events: z.array(eventSchema),
  about: aboutContentSchema,
});

