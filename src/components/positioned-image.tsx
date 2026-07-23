"use client";

import { useRef, useState, useEffect, useCallback } from "react";

export type PositionedImageMode = "cover" | "contain";

export type PositionedImageProps = {
  src: string;
  alt?: string;
  transform?: string;
  mode?: PositionedImageMode;
  className?: string;
  containerClassName?: string;
  draggable?: boolean;
};

export function parseTransform(t: string | undefined): {
  tx: number;
  ty: number;
  scale: number;
} {
  if (!t) return { tx: 0, ty: 0, scale: 1 };
  const m = t.match(/translate\(([^)]+)\)\s*scale\(([^)]+)\)/);
  if (!m) return { tx: 0, ty: 0, scale: 1 };
  const [x, y] = m[1].split(/,\s*/);
  return {
    tx: parseFloat(x) || 0,
    ty: parseFloat(y) || 0,
    scale: parseFloat(m[2]) ?? 1,
  };
}

export function buildTransform(tx: number, ty: number, scale: number): string {
  return `translate(${Math.round(tx)}px, ${Math.round(ty)}px) scale(${scale})`;
}

export function PositionedImage({
  src,
  alt = "",
  transform = "translate(0px, 0px) scale(1)",
  mode = "cover",
  className,
  containerClassName,
  draggable = false,
}: PositionedImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);

  const { tx, ty, scale: userScale } = parseTransform(transform);

  const measure = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ w: rect.width, h: rect.height });
    }
  }, []);

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    measure();
  };

  const baseScale =
    containerSize.w && containerSize.h && imgSize?.w && imgSize?.h
      ? mode === "cover"
        ? Math.max(containerSize.w / imgSize.w, containerSize.h / imgSize.h)
        : Math.min(containerSize.w / imgSize.w, containerSize.h / imgSize.h)
      : 1;

  const finalScale = baseScale * userScale;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName ?? ""}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          draggable={draggable}
          className={`pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none ${className ?? ""}`}
          style={{
            width: "auto",
            height: "auto",
            transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${finalScale})`,
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-[#6f6a61]">
          No image
        </div>
      )}
    </div>
  );
}
