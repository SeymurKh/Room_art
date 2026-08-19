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
  /** Optional clipPath describing the visible slice. Used only to compute the
   *  target bounding box for sizing/positioning; the caller is responsible for
   *  applying the clipPath to the outer container. */
  clipPath?: string;
  loading?: "eager" | "lazy";
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

/**
 * Compute the bounding box of a CSS polygon() clipPath string.
 * Returns {x, y, w, h} in percentage units (0-100).
 */
function clipPathBoundingBox(clipPath: string): { x: number; y: number; w: number; h: number } | null {
  const m = clipPath.match(/polygon\(([^)]+)\)/i);
  if (!m) return null;
  const points = m[1].split(/,\s*/).map((pair) => {
    const [x, y] = pair.trim().split(/\s+/);
    return { x: parseFloat(x), y: parseFloat(y) };
  });
  if (points.length < 3) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function PositionedImage({
  src,
  alt = "",
  transform = "translate(0px, 0px) scale(1)",
  mode = "cover",
  className,
  containerClassName,
  draggable = false,
  clipPath,
  loading = "lazy",
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
      setSizes((prev) =>
        prev.container.w === rect.width && prev.container.h === rect.height
          ? prev
          : { ...prev, container: { w: rect.width, h: rect.height } }
      );
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

  const bbox = clipPath ? clipPathBoundingBox(clipPath) : null;

  // Target area is either the full container or the bounding box of the clipPath slice.
  const target = bbox
    ? {
        w: sizes.container.w * (bbox.w / 100),
        h: sizes.container.h * (bbox.h / 100),
        cx: sizes.container.w * (bbox.x / 100 + bbox.w / 200),
        cy: sizes.container.h * (bbox.y / 100 + bbox.h / 200),
      }
    : {
        w: sizes.container.w,
        h: sizes.container.h,
        cx: sizes.container.w / 2,
        cy: sizes.container.h / 2,
      };

  const hasImage = sizes.image && sizes.image.w > 0 && sizes.image.h > 0;
  const hasTarget = target.w > 0 && target.h > 0;

  const baseScale =
    hasImage && hasTarget
      ? mode === "cover"
        ? Math.max(target.w / sizes.image!.w, target.h / sizes.image!.h)
        : Math.min(target.w / sizes.image!.w, target.h / sizes.image!.h)
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
          loading={loading}
          className={`pointer-events-none absolute max-w-none select-none transition-opacity duration-300 ${sizes.ready ? "opacity-100" : "opacity-0"} ${className ?? ""}`}
          style={{
            width: "auto",
            height: "auto",
            left: target.cx,
            top: target.cy,
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
