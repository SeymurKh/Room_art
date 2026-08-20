"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Artwork } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

/**
 * ArtworkSalon — «салонная развеска» с честным восприятием размера.
 *
 * Масштаб считается от ПЛОЩАДИ работы, а не от ширины:
 *  - база: стороны × k (px на см, зависит от устройства);
 *  - минимум по площади: крошечная работа остаётся маленькой, но смотрибельной;
 *    внутри «пола» порядок по реальной площади сохраняется (добавка A×0.5);
 *  - потолок по длинной стороне, равномерно — большие работы не ломают раскладку.
 * Равные площади (120×140 и 140×120) выглядят равными.
 */

type ScaleConfig = { k: number; minArea: number; maxLong: number };

function configFor(viewportWidth: number): ScaleConfig {
  if (viewportWidth < 640) {
    return { k: 2.4, minArea: 10000, maxLong: Math.min(viewportWidth * 0.92, 420) };
  }
  if (viewportWidth < 1024) {
    return { k: 3.2, minArea: 16000, maxLong: 640 };
  }
  return { k: 4.6, minArea: 22000, maxLong: 920 };
}

function displayWidth(artwork: Artwork, cfg: ScaleConfig): number {
  const w0 = artwork.widthCm * cfg.k;
  const h0 = artwork.heightCm * cfg.k;
  const area = w0 * h0;
  // Комфортный минимум по площади; +area×0.5 сохраняет порядок внутри минимума
  const targetArea = Math.max(area, cfg.minArea + area * 0.5);
  let scale = Math.sqrt(targetArea / area);
  const long = Math.max(w0, h0) * scale;
  if (long > cfg.maxLong) scale *= cfg.maxLong / long;
  return Math.round(w0 * scale);
}

function useScaleConfig(): ScaleConfig | null {
  // null до монтирования: SSR и первый рендер совпадают, без hydration-конфликта
  const [cfg, setCfg] = useState<ScaleConfig | null>(null);

  useEffect(() => {
    const update = () => setCfg(configFor(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cfg;
}

export function ArtworkSalon({
  artworks,
  dark = false,
  artistLabel,
  showPrice = false,
}: {
  artworks: Artwork[];
  dark?: boolean;
  artistLabel?: (slug: string) => string;
  showPrice?: boolean;
}) {
  const cfg = useScaleConfig();

  const titleColor = dark ? "text-[#f4f1ea]" : "text-[#11100e]";
  const subColor = dark ? "text-white/55" : "text-[#6f6a61]";
  const dimColor = dark ? "text-white/40" : "text-[#6f6a61]/80";
  const arrowColor = dark
    ? "text-white/25 group-hover:text-[#f4f1ea]"
    : "text-black/25 group-hover:text-[#11100e]";

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-8 gap-y-12 transition-opacity duration-300 md:gap-x-12 md:gap-y-16"
      style={{ opacity: cfg ? 1 : 0 }}
      aria-hidden={!cfg}
    >
      {artworks.map((artwork) => (
        <Link
          href={`/gallery/${artwork.slug}`}
          key={artwork.slug}
          className="group block"
          style={{
            width: cfg ? displayWidth(artwork, cfg) : undefined,
            visibility: cfg ? "visible" : "hidden",
            maxWidth: "100%",
          }}
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
            <span className="overlay-text">View artwork</span>
          </div>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`room-serif truncate text-lg leading-tight ${titleColor}`}>
                {artwork.title}
              </p>
              <p className={`mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${subColor}`}>
                {artistLabel
                  ? `${artistLabel(artwork.artistSlug)} · ${artwork.year}`
                  : `${artwork.medium}, ${artwork.year}`}
              </p>
              <p className={`mt-1 text-xs ${dimColor}`}>{artwork.dimensions}</p>
              {showPrice && artwork.priceAzn != null ? (
                <p className={`mt-1 text-xs font-semibold tracking-[0.06em] ${titleColor}`}>
                  AZN {artwork.priceAzn.toLocaleString()}
                </p>
              ) : null}
            </div>
            <ArrowUpRight size={15} className={`mt-1 shrink-0 transition ${arrowColor}`} />
          </div>
        </Link>
      ))}
    </div>
  );
}