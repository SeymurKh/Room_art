"use client";

import { useState, useRef, useCallback } from "react";
import type { Artwork } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

const ZOOM = 4;
const LENS_SIZE = 350;

// Размеры заданы в процентах вьюпорта:
// - референс 140×140 см занимает BASE_WIDTH_VW ширины экрана;
// - дальше размер растёт суб-линейно (степень COMPRESSION_POW < 1),
//   поэтому крупные работы крупнее, но рост постепенно насыщается;
// - окончательно ширина ограничена MAX_WIDTH_VW по ширине и MAX_HEIGHT_VH
//   по высоте (пересчитанной в ширину через соотношение сторон).
const BASE_WIDTH_VW = 56;
const MAX_WIDTH_VW = 72;
const MAX_HEIGHT_VH = 68;
const COMPRESSION_POW = 0.42;
const REFERENCE_CM = 140;

/**
 * compression — «сжатый» масштаб по площади относительно референса 140×140 см.
 *
 * Возвращает коэффициент >= 1 для работ крупнее референса и < 1 для меньших,
 * но со степенью меньше 1: рост нелинейный и не раздувает большие полотна.
 */
export function compressionFactor(widthCm: number, heightCm: number): number {
  const area = widthCm * heightCm;
  const refArea = REFERENCE_CM * REFERENCE_CM;
  return Math.pow(area / refArea, COMPRESSION_POW);
}

/**
 * ArtworkFrame — высокореалистичная галерейная рама (CSS-only 3D).
 *
 * Пропорции берутся из заявленных габаритов (widthCm/heightCm), чтобы размер
 * на экране совпадал с dimensions и не «скакал» после загрузки изображения.
 *
 * Круглые работы (tondo) рендерятся без рамы и тёмной подложки — только
 * круглое изображение (лупа на детальной странице сохраняется).
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
  const compression = compressionFactor(artwork.widthCm, artwork.heightCm);
  const ratio = artwork.widthCm / artwork.heightCm;
  const tondo = artwork.tondo ?? false;

  if (tondo) {
    return (
      <MagnifierLens
        src={artwork.image}
        alt={artwork.title}
        priority={priority}
        fallbackText={artwork.title}
        compression={compression}
        aspectRatio={1}
        enableLens={enableLens}
        tondo
      />
    );
  }

  // Меньшие рамы на мобильном, чтобы картина помещалась на экран
  const outerPadding = `${Math.round(8 + compression * 4)}px`;

  return (
    <div className="frame-outer inline-block" style={{ padding: outerPadding }}>
      <MagnifierLens
        src={artwork.image}
        alt={artwork.title}
        priority={priority}
        fallbackText={artwork.title}
        compression={compression}
        aspectRatio={ratio}
        enableLens={enableLens}
      />
    </div>
  );
}

function MagnifierLens({
  src,
  alt,
  priority,
  fallbackText,
  compression,
  aspectRatio,
  enableLens,
  tondo = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  fallbackText: string;
  compression: number;
  aspectRatio: number;
  enableLens: boolean;
  tondo?: boolean;
}) {
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Итоговая ширина: базовый размер по сжатию, ограниченный шириной и высотой
  // вьюпорта (высотный лимит пересчитан в ширину через aspect ratio).
  const desiredVw = BASE_WIDTH_VW * compression;
  const heightCappedVh = MAX_HEIGHT_VH * aspectRatio;

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
      className={`frame-artwork relative ${enableLens ? "cursor-crosshair" : ""} ${tondo ? "overflow-hidden rounded-full" : ""}`}
      style={{
        width: `min(${desiredVw}vw, ${MAX_WIDTH_VW}vw, ${heightCappedVh}vh)`,
        aspectRatio: tondo ? "1 / 1" : `${aspectRatio}`,
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
      {!tondo ? <div className="frame-artwork-overlay" aria-hidden="true" /> : null}

      {enableLens && active && (
        <div
          className="pointer-events-none absolute z-50 rounded-full border-2 border-white/80 shadow-xl"
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