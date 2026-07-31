"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Artwork } from "@/lib/types";
import { ArtworkFrame } from "@/components/artwork-frame";

const SWIPE_THRESHOLD = 50;

export function MobileArtworkCarousel({ artworks }: { artworks: Artwork[] }) {
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
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

  const handleDragStart = useCallback(() => setDragging(true), []);
  const handleDragEnd = useCallback((_: unknown, info: { offset: { x: number } }) => {
    setDragging(false);
    const offset = info.offset.x;
    if (offset < -SWIPE_THRESHOLD) {
      next();
    } else if (offset > SWIPE_THRESHOLD) {
      prev();
    }
    x.set(0);
  }, [next, prev, x]);

  useMotionValueEvent(springX, "change", () => {
    // keep track for potential side effects
  });

  if (n === 0) return null;

  const artwork = artworks[index];

  return (
    <section className="relative bg-[#ded8cc] py-12 md:hidden" ref={containerRef}>
      <div className="room-shell mb-6">
        <p className="section-kicker text-[#6f6a61]">On display</p>
        <h2 className="room-serif mt-2 text-3xl font-medium leading-none">Works in the room</h2>
      </div>

      <div className="relative overflow-hidden">
        <motion.div
          drag={canSwipe ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          style={{ x: springX }}
          className="flex items-center justify-center"
        >
          <motion.div
            key={artwork.slug}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex w-full flex-col items-center"
          >
            <ArtworkFrame artwork={artwork} priority />
            <Link
              href={`/gallery/${artwork.slug}`}
              className="room-shell mt-6 flex w-full items-start justify-between gap-4"
            >
              <div>
                <h3 className="room-serif text-3xl leading-none">{artwork.title}</h3>
                <p className="mt-2 text-sm text-[#6f6a61]">
                  {artwork.medium}, {artwork.year}
                </p>
              </div>
              <ArrowUpRight size={18} className="mt-1 shrink-0 opacity-40" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {canSwipe && (
        <div className="room-shell mt-8 flex items-center justify-between">
          <div className="flex gap-2">
            {artworks.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-[#11100e]" : "w-1.5 bg-[#11100e]/20"
                }`}
                aria-label={`Go to artwork ${i + 1}`}
              />
            ))}
          </div>
          <p className="text-xs text-[#6f6a61]">
            {index + 1} / {n}
          </p>
        </div>
      )}
    </section>
  );
}
