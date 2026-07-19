"use client";

import type { Artwork } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

/**
 * scaleFactor — масштаб от 0.55 (маленькие) до 1.0 (большие).
 * Референс: макс. размер картины ~140см.
 */
export function scaleFactor(widthCm: number, heightCm: number): number {
  const maxDim = Math.max(widthCm, heightCm);
  const refMax = 140;
  return 0.55 + (maxDim / refMax) * 0.45;
}

/**
 * ArtworkFrame — высокореалистичная галерейная рама (CSS-only 3D).
 * Слои: frame-outer (внешняя рама) → frame-mat (паспарту) → изображение.
 */
export function ArtworkFrame({
  artwork,
  priority,
}: {
  artwork: Artwork;
  priority?: boolean;
}) {
  const aspect = artwork.widthCm / artwork.heightCm;
  const isPortrait = aspect < 1;
  const scale = scaleFactor(artwork.widthCm, artwork.heightCm);

  const baseWidth = isPortrait ? `${40 * scale}vw` : `${65 * scale}vw`;
  const maxWidth = isPortrait ? `${420 * scale}px` : `${700 * scale}px`;
  // Внешняя рама: 15-20px (масштабируется)
  const outerPadding = `${Math.round(15 + scale * 5)}px`;
  // Паспарту: ~40-60px (масштабируется)
  const matPadding = `${Math.round(40 + scale * 20)}px`;

  return (
    <div
      className="frame-outer"
      style={{
        width: `min(${baseWidth}, ${maxWidth})`,
        aspectRatio: `${artwork.widthCm} / ${artwork.heightCm}`,
        padding: outerPadding,
      }}
    >
      <div className="frame-mat h-full w-full" style={{ padding: matPadding }}>
        <div className="relative h-full w-full">
          <RoomImage
            src={artwork.image}
            alt={artwork.title}
            fill
            priority={priority}
            className="object-cover"
            fallbackText={artwork.title}
          />
        </div>
      </div>
    </div>
  );
}