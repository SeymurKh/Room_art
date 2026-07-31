"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Artwork } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

const ZOOM = 4;
const LENS_SIZE = 350;

/**
 * scaleFactor — масштаб от 0.4 (маленькие) до 1.0 (большие).
 * Референс: площадь картины 140×140 см.
 */
export function scaleFactor(widthCm: number, heightCm: number): number {
  const area = widthCm * heightCm;
  const refArea = 140 * 140;
  return Math.min(1, Math.sqrt(area / refArea));
}

/**
 * ArtworkFrame — высокореалистичная галерейная рама (CSS-only 3D).
 * Слои: frame-outer (внешняя рама) → frame-mat (паспарту) → изображение.
 *
 * aspectRatio берётся от реального изображения, чтобы не было полей
 * и обрезки. Масштаб зависит от указанных габаритов в см.
 */
export function ArtworkFrame({
  artwork,
  priority,
  enableLens = false,
}: {
  artwork: Artwork;
  priority?: boolean;
  enableLens?: boolean;
}) {
  const scale = scaleFactor(artwork.widthCm, artwork.heightCm);

  // Меньшие рамы на мобильном, чтобы картина помещалась на экран
  const outerPadding = `${Math.round(8 + scale * 4)}px`;
  const matPadding = `${Math.round(18 + scale * 10)}px`;

  return (
    <div className="frame-outer inline-block" style={{ padding: outerPadding }}>
      <div className="frame-mat inline-block" style={{ padding: matPadding }}>
        <MagnifierLens
          src={artwork.image}
          alt={artwork.title}
          priority={priority}
          fallbackText={artwork.title}
          scale={scale}
          enableLens={enableLens}
        />
      </div>
    </div>
  );
}

function useImageAspect(src: string) {
  const [aspect, setAspect] = useState<number | null>(null);

  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.onerror = () => setAspect(null);
  }, [src]);

  return aspect;
}

function MagnifierLens({
  src,
  alt,
  priority,
  fallbackText,
  scale,
  enableLens,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  fallbackText: string;
  scale: number;
  enableLens: boolean;
}) {
  const imageAspect = useImageAspect(src);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // На мобильном ограничиваем ширину картины окном
  const baseWidth = `${Math.min(78, 60 * scale)}vw`;
  const maxWidth = `${Math.min(420, 700 * scale)}px`;

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
      className={`frame-artwork relative ${enableLens ? "cursor-crosshair" : ""}`}
      style={{
        width: `min(${baseWidth}, ${maxWidth})`,
        aspectRatio: imageAspect ? `${imageAspect}` : "1 / 1",
      }}
      onMouseEnter={enableLens ? handleEnter : undefined}
      onMouseMove={enableLens ? handleMove : undefined}
      onMouseLeave={enableLens ? handleLeave : undefined}
    >
      <RoomImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        fallbackText={fallbackText}
      />
      <div className="frame-artwork-overlay" aria-hidden="true" />

      {enableLens && active && (
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
