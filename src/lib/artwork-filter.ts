import type { Artwork } from "@/lib/types";

/**
 * Единая логика фильтрации коллекции — используется и в списке галереи
 * (GalleryFilter), и в контекстной навигации на детальной странице картины
 * (artwork-nav), чтобы порядок обхода гарантированно совпадал с тем,
 * что видит пользователь в галерее.
 */

export const ALL = "All";

export type FormatCategory = "Landscape" | "Square" | "Portrait";
export type SizeCategory = "Small" | "Medium" | "Large";

/** Критерии фильтра галереи — зеркалят query-параметры artist/format/size/price. */
export type GalleryFilterCriteria = {
  artist: string;
  format: string;
  size: string;
  price: string;
};

export function getFormat(artwork: { widthCm: number; heightCm: number }): FormatCategory {
  const { widthCm, heightCm } = artwork;
  const max = Math.max(widthCm, heightCm);
  if (max === 0) return "Portrait";
  const ratio = Math.abs(widthCm - heightCm) / max;
  if (ratio <= 0.05) return "Square";
  return widthCm > heightCm ? "Landscape" : "Portrait";
}

export function getSizeCategory(artwork: { widthCm: number; heightCm: number }): SizeCategory {
  const max = Math.max(artwork.widthCm, artwork.heightCm);
  if (max < 50) return "Small";
  if (max <= 100) return "Medium";
  return "Large";
}

export function priceRangeLabel(value: string): string {
  switch (value) {
    case "under-1000":
      return "Under AZN 1,000";
    case "1000-3000":
      return "AZN 1,000 – 3,000";
    case "3000-5000":
      return "AZN 3,000 – 5,000";
    case "over-5000":
      return "Over AZN 5,000";
    default:
      return ALL;
  }
}

export function matchesPriceRange(artwork: Artwork, range: string): boolean {
  const price = artwork.priceAzn;
  if (price == null) return false;
  switch (range) {
    case "under-1000":
      return price < 1000;
    case "1000-3000":
      return price >= 1000 && price <= 3000;
    case "3000-5000":
      return price >= 3000 && price <= 5000;
    case "over-5000":
      return price > 5000;
    default:
      return true;
  }
}

/** Отбирает работы по критериям фильтра, сохраняя порядок коллекции. */
export function filterArtworks(artworks: Artwork[], criteria: GalleryFilterCriteria): Artwork[] {
  return artworks.filter(
    (item) =>
      (criteria.artist === ALL || item.artistSlug === criteria.artist) &&
      (criteria.format === ALL || getFormat(item) === criteria.format) &&
      (criteria.size === ALL || getSizeCategory(item) === criteria.size) &&
      (criteria.price === ALL || matchesPriceRange(item, criteria.price))
  );
}