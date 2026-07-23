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
  const imgRef = useRef<HTMLImageElement>(null);
  const [sizes, setSizes] = useState<{
    container: { w: number; h: number };
    image: { w: number; h: number } | null;
    ready: boolean;
  }>({ container: { w: 0, h: 0 }, image: null, ready: false });

  const { tx, ty, scale: userScale } = parseTransform(transform);

  const measure = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSizes((prev) => (prev.container.w === rect.width && prev.container.h === rect.height ? prev : { ...prev, container: { w: rect.width, h: rect.height } }));
    }
  }, []);

  useEffect(() => {
    measure();

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(container);

    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    function updateSize() {
      const current = imgRef.current;
      if (current && current.naturalWidth && current.naturalHeight) {
        setSizes((prev) => ({
          ...prev,
          image: { w: current.naturalWidth, h: current.naturalHeight },
          ready: true,
        }));
      }
    }

    if (img.complete) {
      updateSize();
    }

    img.addEventListener("load", updateSize);
    return () => img.removeEventListener("load", updateSize);
  }, [src]);

  const baseScale =
    sizes.container.w && sizes.container.h && sizes.image?.w && sizes.image?.h
      ? mode === "cover"
        ? Math.max(sizes.container.w / sizes.image.w, sizes.container.h / sizes.image.h)
        : Math.min(sizes.container.w / sizes.image.w, sizes.container.h / sizes.image.h)
      : 1;

  const finalScale = baseScale * userScale;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName ?? ""}`}
    >
      {src ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={draggable}
          className={`pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none transition-opacity duration-300 ${sizes.ready ? "opacity-100" : "opacity-0"} ${className ?? ""}`}
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
