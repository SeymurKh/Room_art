"use client";

import { useState, useRef, useCallback } from "react";
import type { Artwork } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

const ZOOM = 2.5;
const LENS_SIZE = 180;

/**
 * scaleFactor — масштаб от 0.55 (маленькие) до 1.0 (большие).
 * Референс: макс. размер картины ~140см.
 */
export function scaleFactor(widthCm: number, heightCm: number): number {
  const maxDim = Math.max(widthCm, heightCm);
  const refMax = 140;
  return Math.min(1, 0.55 + (maxDim / refMax) * 0.45);
}

/**
 * ArtworkFrame — высокореалистичная галерейная рама (CSS-only 3D).
 * Слои: frame-outer (внешняя рама) → frame-mat (паспарту) → изображение.
 *
 * aspectRatio задаётся на самом контейнере картины, чтобы изображение
 * отображалось на 100% без обрезки.
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

  const baseWidth = isPortrait ? `${45 * scale}vw` : `${75 * scale}vw`;
  const maxWidth = isPortrait ? `${500 * scale}px` : `${800 * scale}px`;
  const outerPadding = `${Math.round(12 + scale * 6)}px`;
  const matPadding = `${Math.round(28 + scale * 16)}px`;

  return (
    <div className="frame-outer inline-block" style={{ padding: outerPadding }}>
      <div className="frame-mat inline-block" style={{ padding: matPadding }}>
        <MagnifierLens
          src={artwork.image}
          alt={artwork.title}
          priority={priority}
          fallbackText={artwork.title}
          aspectRatio={`${artwork.widthCm} / ${artwork.heightCm}`}
          baseWidth={baseWidth}
          maxWidth={maxWidth}
        />
      </div>
    </div>
  );
}

function MagnifierLens({
  src,
  alt,
  priority,
  fallbackText,
  aspectRatio,
  baseWidth,
  maxWidth,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  fallbackText: string;
  aspectRatio: string;
  baseWidth: string;
  maxWidth: string;
}) {
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    setSize({ w: rect.width, h: rect.height });
  }, []);

  const handleEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      handleMove(e);
      setActive(true);
    },
    [handleMove]
  );

  const handleLeave = useCallback(() => {
    setActive(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="frame-artwork relative cursor-crosshair"
      style={{
        width: `min(${baseWidth}, ${maxWidth})`,
        aspectRatio,
      }}
      onMouseEnter={handleEnter}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <RoomImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-contain"
        fallbackText={fallbackText}
      />
      <div className="frame-artwork-overlay" aria-hidden="true" />

      {active && (
        <div
          className="pointer-events-none fixed z-50 rounded-full border-2 border-white/80 shadow-xl"
          style={{
            width: LENS_SIZE,
            height: LENS_SIZE,
            left: `calc(${pos.x}% - ${LENS_SIZE / 2}px)`,
            top: `calc(${pos.y}% - ${LENS_SIZE / 2}px)`,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${size.w * ZOOM}px ${size.h * ZOOM}px`,
            backgroundPosition: `${-pos.x * ZOOM * (size.w / 100) + LENS_SIZE / 2}px ${-pos.y * ZOOM * (size.h / 100) + LENS_SIZE / 2}px`,
          }}
        />
      )}
    </div>
  );
}
