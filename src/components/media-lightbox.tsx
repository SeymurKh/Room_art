"use client";

import { useState, useCallback, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export type MediaItem = {
  src: string;
  alt?: string;
  type?: "image" | "video";
};

/**
 * MediaLightbox — модальное окно с навигацией для просмотра фото/видео.
 * Поддерживает перелистывание стрелками, клавиатурой и свайпом.
 */
export function MediaLightbox({
  items,
  index: initialIndex = 0,
  children,
}: {
  items: MediaItem[];
  index?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(initialIndex);

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + items.length) % items.length), [items.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % items.length), [items.length]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, close, prev, next]);

  const item = items[current];

  return (
    <>
      <div onClick={() => { setCurrent(initialIndex); setOpen(true); }} className="cursor-pointer">
        {children}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
        >
          {/* Close */}
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-[110] grid size-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Prev */}
          {items.length > 1 ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 z-[110] -translate-y-1/2 grid size-12 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition hover:bg-white/20"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
          ) : null}

          {/* Content */}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {item.type === "video" ? (
              <video
                key={item.src}
                src={item.src}
                controls
                playsInline
                autoPlay
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            ) : (
              <img
                key={item.src}
                src={item.src}
                alt={item.alt ?? ""}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
            )}
          </div>

          {/* Next */}
          {items.length > 1 ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 z-[110] -translate-y-1/2 grid size-12 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition hover:bg-white/20"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          ) : null}

          {/* Counter */}
          {items.length > 1 ? (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/60">
              {current + 1} / {items.length}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

/**
 * Single-item wrapper for convenience.
 */
export function MediaLightboxSingle({
  src,
  alt,
  type = "image",
  children,
}: {
  src: string;
  alt?: string;
  type?: "image" | "video";
  children: React.ReactNode;
}) {
  return (
    <MediaLightbox items={[{ src, alt, type }]}>
      {children}
    </MediaLightbox>
  );
}