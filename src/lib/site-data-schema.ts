import { z } from "zod";
import { toLocalizedText } from "@/lib/i18n/config";

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(120, "Slug must be 120 characters or fewer")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens");

/**
 * Локализованный текст. На входе принимает и легаси-строку (до миграции),
 * и объект { en, az }. EN обязателен; AZ может быть пуст (фолбэк на EN
 * происходит при отображении — см. pickLocalized).
 */
const localizedInput = (value: unknown) => toLocalizedText(value);

export const localizedTextSchema = z.preprocess(
  localizedInput,
  z.object({
    en: z.string().default(""),
    az: z.string().default(""),
  })
);

export const localizedRequiredSchema = z.preprocess(
  localizedInput,
  z.object({
    en: z.string().min(1, "English text is required"),
    az: z.string().default(""),
  })
);

export const siteSettingsSchema = z.object({
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(1, "Phone is required"),
  address: localizedRequiredSchema,
  instagram: z.string().url("Instagram must be a valid URL"),
});

export const artistSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1),
  role: localizedRequiredSchema,
  portrait: z.string().default(""),
  photos: z.array(z.string()).default([]),
  bio: localizedTextSchema,
  statement: localizedTextSchema,
});

export const artworkSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  artistSlug: z.string().min(1),
  year: z.string().default(""),
  medium: localizedRequiredSchema,
  dimensions: z.string().min(1),
  widthCm: z.number().positive(),
  heightCm: z.number().positive(),
  image: z.string().min(1),
  availability: z.enum(["Available", "Reserved", "Private collection"]),
  description: localizedTextSchema,
  priceAzn: z.number().int().nonnegative().nullable().default(null),
  displayed: z.boolean().default(false),
  tondo: z.boolean().default(false),
});

export const eventSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1),
  status: z.enum(["Upcoming", "Current", "Past"]),
  date: localizedRequiredSchema,
  image: z.string(),
  heroTransform: z.string().default("translate(0px, 0px) scale(1)"),
  thumbTransform: z.string().default("translate(0px, 0px) scale(1)"),
  detailTransform: z.string().default("translate(0px, 0px) scale(1)"),
  featured: z.boolean().default(false),
  description: localizedTextSchema,
  gallery: z.array(z.string()).default([]),
  video: z.string().default(""),
});

const aboutContentSchema = z.object({
  concept: localizedRequiredSchema,
  vision: localizedRequiredSchema,
  identity: localizedRequiredSchema,
});

export const siteDataSchema = z.object({
  settings: siteSettingsSchema,
  artists: z.array(artistSchema),
  artworks: z.array(artworkSchema),
  events: z.array(eventSchema),
  about: aboutContentSchema,
}).superRefine((data, context) => {
  const collections = [
    ["artists", data.artists],
    ["artworks", data.artworks],
    ["events", data.events],
  ] as const;

  for (const [collectionName, items] of collections) {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item.slug)) {
        context.addIssue({
          code: "custom",
          path: [collectionName, index, "slug"],
          message: `Duplicate slug "${item.slug}"`,
        });
      }
      seen.add(item.slug);
    });
  }

  const artistSlugs = new Set(data.artists.map((artist) => artist.slug));
  data.artworks.forEach((artwork, index) => {
    if (!artistSlugs.has(artwork.artistSlug)) {
      context.addIssue({
        code: "custom",
        path: ["artworks", index, "artistSlug"],
        message: `Artist "${artwork.artistSlug}" does not exist`,
      });
    }
  });
});

