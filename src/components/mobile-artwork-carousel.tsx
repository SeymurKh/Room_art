"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Artwork } from "@/lib/types";
import { ArtworkFrame } from "@/components/artwork-frame";

const SWIPE_THRESHOLD = 50;

export function MobileArtworkCarousel({ artworks, scale = 1, onScaleChange }: { artworks: Artwork[]; scale?: number; onScaleChange?: (s: number) => void }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 30 });

  const n = artworks.length;
  const canSwipe = n > 1;

  const goTo = useCallback((next: number) => {
    if (!canSwipe) return;
    setIndex((next % n + n) % n);
  }, [canSwipe, n]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    const offset = info.offset.x;
    if (offset < -SWIPE_THRESHOLD) {
      next();
    } else if (offset > SWIPE_THRESHOLD) {
      prev();
    }
    x.set(0);
  }, [next, prev, x]);

  if (n === 0) return null;

  const artwork = artworks[index];

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:hidden"
      ref={containerRef}
    >
      {/* Wall background — same as desktop scrolltelling */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/room-wall.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-black/45" aria-hidden="true" />

      {/* Переключатель масштаба */}
      {onScaleChange ? (
        <div className="absolute top-4 right-4 z-40 flex items-center gap-1.5">
          {([1, 1.4, 1.8] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onScaleChange(s)}
              className={`px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] transition ${
                scale === s
                  ? "bg-[#f4f1ea] text-[#11100e]"
                  : "bg-white/10 text-white/60 hover:bg-white/15"
              }`}
            >
              x{s === 1 ? "1" : s === 1.4 ? "2" : "3"}
            </button>
          ))}
        </div>
      ) : null}

      {/* Title */}
      <div className="room-shell relative z-10 mb-6 text-center">
        <p className="room-serif text-lg italic text-[#6f6a61]">Currently on display in Room</p>
      </div>

      {/* Artwork — changes on swipe, section stays fixed */}
      <motion.div
        drag={canSwipe ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x: springX }}
        className="relative z-10 flex flex-1 items-center justify-center overflow-hidden"
      >
        <motion.div
          key={artwork.slug}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <ArtworkFrame artwork={artwork} priority scale={scale} />
        </motion.div>
      </motion.div>

      {/* Bottom: title, all gallery, dots */}
      <div className="room-shell absolute bottom-4 left-0 right-0 z-10 flex flex-col items-center gap-2">
        <Link
          href={`/gallery/${artwork.slug}`}
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-[#f4f1ea]/80"
        >
          {artwork.title} <ArrowUpRight size={14} />
        </Link>
        <Link
          href="/gallery"
          className="flex items-center gap-2 border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea] transition hover:bg-white/10"
        >
          All gallery <ArrowUpRight size={12} />
        </Link>

        {canSwipe && (
          <div className="flex gap-2">
            {artworks.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-[#f4f1ea]" : "w-1.5 bg-[#f4f1ea]/20"
                }`}
                aria-label={`Go to artwork ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}