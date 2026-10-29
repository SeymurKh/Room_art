import type { Artwork } from "@/lib/types";
import { ALL, filterArtworks, type GalleryFilterCriteria } from "@/lib/artwork-filter";

/**
 * Контекстная навигация между картинами на детальной странице (/gallery/[slug]).
 *
 * Пул prev/next определяется тем, откуда пользователь открыл работу —
 * query-параметром ctx в ссылке:
 *
 *   ?ctx=artist:<slug>                — работы одного художника (страница художника);
 *   ?ctx=gallery                      — вся коллекция в порядке галереи (галерея);
 *   ?ctx=gallery&artist=&format=&...  — отфильтрованный набор (галерея с фильтром:
 *                                       параметры повторяют фильтр; page не учитывается);
 *   ?ctx=displayed                    — работы, отмеченные displayed (главная страница);
 *   без ctx                           — fallback: вся коллекция в порядке галереи.
 *
 * Обход циклический: после последней картины снова первая.
 */

export type ArtworkNavContext =
  | { kind: "artist"; artistSlug: string }
  | { kind: "gallery"; filters: GalleryFilterCriteria }
  | { kind: "displayed" }
  | { kind: "collection" };

export function parseNavContext(params: URLSearchParams): ArtworkNavContext {
  const ctx = params.get("ctx") ?? "";
  if (ctx.startsWith("artist:")) {
    const artistSlug = ctx.slice("artist:".length);
    if (artistSlug) return { kind: "artist", artistSlug };
  }
  if (ctx === "gallery") {
    return {
      kind: "gallery",
      filters: {
        artist: params.get("artist") ?? ALL,
        format: params.get("format") ?? ALL,
        size: params.get("size") ?? ALL,
        price: params.get("price") ?? ALL,
      },
    };
  }
  if (ctx === "displayed") return { kind: "displayed" };
  return { kind: "collection" };
}

/**
 * Возвращает упорядоченный пул работ для обхода.
 * Пустой пул по контексту (например, битый artistSlug) — fallback на всю коллекцию.
 */
export function resolveArtworkPool(artworks: Artwork[], ctx: ArtworkNavContext): Artwork[] {
  let pool: Artwork[];
  switch (ctx.kind) {
    case "artist":
      pool = artworks.filter((item) => item.artistSlug === ctx.artistSlug);
      break;
    case "gallery":
      pool = filterArtworks(artworks, ctx.filters);
      break;
    case "displayed":
      pool = artworks.filter((item) => item.displayed);
      break;
    default:
      return artworks;
  }
  return pool.length > 0 ? pool : artworks;
}

/**
 * Предыдущая и следующая работы в пуле (по кругу).
 * null — если в пуле одна работа или currentSlug не найден.
 */
export function getAdjacentArtwork(
  pool: Artwork[],
  currentSlug: string
): { prev: Artwork; next: Artwork } | null {
  if (pool.length <= 1) return null;
  const index = pool.findIndex((item) => item.slug === currentSlug);
  if (index === -1) return null;
  const prev = pool[(index - 1 + pool.length) % pool.length];
  const next = pool[(index + 1) % pool.length];
  return { prev, next };
}

/** Ссылка на работу с сохранением контекста обхода (ctx + параметры фильтра). */
export function buildArtworkHref(slug: string, ctx: ArtworkNavContext): string {
  const params = new URLSearchParams();
  switch (ctx.kind) {
    case "artist":
      params.set("ctx", `artist:${ctx.artistSlug}`);
      break;
    case "gallery": {
      params.set("ctx", "gallery");
      const { artist, format, size, price } = ctx.filters;
      if (artist && artist !== ALL) params.set("artist", artist);
      if (format && format !== ALL) params.set("format", format);
      if (size && size !== ALL) params.set("size", size);
      if (price && price !== ALL) params.set("price", price);
      break;
    }
    case "displayed":
      params.set("ctx", "displayed");
      break;
    default:
      break;
  }
  const query = params.toString();
  return query ? `/gallery/${slug}?${query}` : `/gallery/${slug}`;
}