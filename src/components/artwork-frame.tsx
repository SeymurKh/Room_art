"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Artwork } from "@/lib/types";
import { RoomImage } from "@/components/room-image";
import { computeArtworkSize, useViewportSize } from "@/lib/artwork-scale";

const ZOOM = 4;
const LENS_SIZE = 350;

/**
 * ArtworkFrame — высокореалистичная галерейная рама (CSS-only 3D).
 *
 * Пропорции берутся из заявленных габаритов (widthCm/heightCm); фактический
 * размер считает единая функция computeArtworkSize, общая для всех секций.
 *
 * Круглые работы (tondo) рендерятся без рамы и тёмной подложки — только
 * круглое изображение (лупа на детальной странице сохраняется).
 */
export function ArtworkFrame({
  artwork,
  priority,
  enableLens = false,
  scale = 1,
}: {
  artwork: Artwork;
  priority?: boolean;
  enableLens?: boolean;
  scale?: number;
}) {
  const tondo = artwork.tondo ?? false;
  const viewport = useViewportSize();
  const size = computeArtworkSize(
    artwork.widthCm,
    artwork.heightCm,
    viewport,
    tondo,
    scale
  );

  if (tondo) {
    return (
      <MagnifierLens
        src={artwork.image}
        alt={artwork.title}
        priority={priority}
        fallbackText={artwork.title}
        widthPx={size.width}
        heightPx={size.height}
        enableLens={enableLens}
        tondo
      />
    );
  }

  return (
    <div
      className="frame-outer inline-block"
      style={{ padding: `${Math.round(3 + size.width * 0.012)}px` }}
    >
      <MagnifierLens
        src={artwork.image}
        alt={artwork.title}
        priority={priority}
        fallbackText={artwork.title}
        widthPx={size.width}
        heightPx={size.height}
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
  widthPx,
  heightPx,
  enableLens,
  tondo = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  fallbackText: string;
  widthPx: number;
  heightPx: number;
  enableLens: boolean;
  tondo?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* ======== Shared: container size ======== */
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSize({ w: rect.width, h: rect.height });
  }, []);

  /* ======== Desktop: hover lens ======== */
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const updatePos = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    setSize({ w: rect.width, h: rect.height });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => updatePos(e.clientX, e.clientY),
    [updatePos]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updatePos(e.clientX, e.clientY);
      setActive(true);
    },
    [updatePos]
  );

  const handleMouseLeave = useCallback(() => setActive(false), []);

  return (
    <div
      ref={containerRef}
      className={`frame-artwork relative ${
        enableLens && !isMobile ? "cursor-crosshair" : ""
      }`}
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
      }}
      onMouseEnter={enableLens && !isMobile ? handleMouseEnter : undefined}
      onMouseMove={enableLens && !isMobile ? handleMouseMove : undefined}
      onMouseLeave={enableLens ? handleMouseLeave : undefined}
    >
      <div className={tondo ? "overflow-hidden rounded-full absolute inset-0" : ""}>
        <RoomImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          fallbackText={fallbackText}
        />
      </div>
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