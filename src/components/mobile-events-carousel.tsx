"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Event } from "@/lib/types";

const SWIPE_THRESHOLD = 50;

export function MobileEventsCarousel({ events }: { events: Event[] }) {
  // Order: current first, then upcoming, then past
  const sorted = [...events].sort((a, b) => {
    const order: Record<string, number> = { Current: 0, Upcoming: 1, Past: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 30 });

  const n = sorted.length;
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

  const event = sorted[index];

  return (
    <section className="relative bg-[#11100e] py-10 text-[#f4f1ea] md:hidden" ref={containerRef}>
      <div className="room-shell mb-5">
        <p className="room-serif text-3xl font-medium leading-none">Events</p>
      </div>

      <div className="relative overflow-hidden">
        <motion.div
          drag={canSwipe ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x: springX }}
          className="flex items-center justify-center"
        >
          <motion.div
            key={event.slug}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <Link href={`/events/${event.slug}`} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#0c0c0b]">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="room-serif text-sm text-white/30">No image</p>
                  </div>
                )}
                {/* Gradient overlay with title at bottom */}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                    {event.status}
                  </span>
                  <h3 className="room-serif mt-1 text-2xl leading-tight text-[#f4f1ea]">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/50">{event.date}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {canSwipe && (
        <div className="room-shell mt-5 flex items-center justify-between">
          <div className="flex gap-2">
            {sorted.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-6 bg-[#f4f1ea]" : "w-1.5 bg-[#f4f1ea]/20"
                }`}
                aria-label={`Go to event ${i + 1}`}
              />
            ))}
          </div>
          <Link
            href="/events"
            className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50"
          >
            All events <ArrowUpRight size={12} />
          </Link>
        </div>
      )}
    </section>
  );
}