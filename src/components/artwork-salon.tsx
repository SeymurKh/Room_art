"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Artwork } from "@/lib/types";
import { buildArtworkHref, type ArtworkNavContext } from "@/lib/artwork-nav";
import { RoomImage } from "@/components/room-image";
import { computeArtworkSize, useViewportSize } from "@/lib/artwork-scale";
import { getDictionary } from "@/lib/i18n";
import { formatDimensions, pickLocalized } from "@/lib/i18n/config";
import { useLang } from "@/lib/use-lang";

/**
 * ArtworkSalon — «салонная развеска» с честным восприятием размера.
 *
 * Размер каждой работы считает единая функция computeArtworkSize, общая для
 * всех секций (детальная страница, scrolltelling на главной, мобильные карусели).
 * Размеры напрямую привязаны к физическим габаритам (widthCm/heightCm), поэтому
 * порядок «больше в реальности ⇒ больше на экране» соблюдается строго.
 */

export function ArtworkSalon({
  artworks,
  dark = false,
  artistLabel,
  showPrice = false,
  scale = 1,
  navContext = { kind: "collection" },
}: {
  artworks: Artwork[];
  dark?: boolean;
  artistLabel?: (slug: string) => string;
  showPrice?: boolean;
  scale?: number;
  /** Контекст обхода для prev/next на детальной странице (см. artwork-nav). */
  navContext?: ArtworkNavContext;
}) {
  const viewport = useViewportSize();
  const lang = useLang();
  const t = getDictionary(lang);

  const titleColor = dark ? "text-[#f4f1ea]" : "text-[#11100e]";
  const subColor = dark ? "text-white/55" : "text-[#6f6a61]";
  const dimColor = dark ? "text-white/40" : "text-[#6f6a61]/80";
  const arrowColor = dark
    ? "text-white/25 group-hover:text-[#f4f1ea]"
    : "text-black/25 group-hover:text-[#11100e]";

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-12 md:gap-x-12 md:gap-y-16">
      {artworks.map((artwork) => {
        const size = computeArtworkSize(
          artwork.widthCm,
          artwork.heightCm,
          viewport,
          artwork.tondo,
          scale
        );

        return (
          <Link
            href={buildArtworkHref(artwork.slug, navContext, lang)}
            key={artwork.slug}
            className="group block"
            style={{ width: `${size.width}px`, maxWidth: "100%" }}
          >
            <div
              className={`card-img-overlay relative w-full bg-[#e2ded4] ${artwork.tondo ? "rounded-full" : ""}`}
              style={{
                aspectRatio: artwork.tondo
                  ? "1 / 1"
                  : `${artwork.widthCm} / ${artwork.heightCm}`,
              }}
            >
              <RoomImage
                src={artwork.image}
                alt={artwork.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
                fallbackText={artwork.title}
                sizes="(max-width: 640px) 60vw, (max-width: 1024px) 40vw, 30vw"
              />
              <span className="overlay-text">{t.gallery.viewArtwork}</span>
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`room-serif truncate text-lg leading-tight ${titleColor}`}>
                  {artwork.title}
                </p>
                <p className={`mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${subColor}`}>
                  {artistLabel
                    ? `${artistLabel(artwork.artistSlug)}${artwork.year ? ` · ${artwork.year}` : ""}`
                    : `${pickLocalized(artwork.medium, lang)}${artwork.year ? `, ${artwork.year}` : ""}`}
                </p>
                <p className={`mt-1 text-xs ${dimColor}`}>{formatDimensions(artwork, lang)}</p>
                {showPrice && artwork.priceAzn != null ? (
                  <p className={`mt-1 text-xs font-semibold tracking-[0.06em] ${titleColor}`}>
                    {artwork.priceAzn.toLocaleString("en-US")} AZN
                  </p>
                ) : null}
              </div>
              <ArrowUpRight size={15} className={`mt-1 shrink-0 transition ${arrowColor}`} />
            </div>
          </Link>
        );
      })}
    </div>
  );
}