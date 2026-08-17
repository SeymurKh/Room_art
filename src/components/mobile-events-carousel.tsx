"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Event } from "@/lib/types";
import { PositionedImage } from "@/components/positioned-image";

const SWIPE_THRESHOLD = 50;

export function MobileEventsCarousel({ events }: { events: Event[] }) {
  const upcoming = events.find((e) => e.status === "Upcoming") ?? null;
  const current = events.find((e) => e.status === "Current") ?? null;
  const past = events.find((e) => e.status === "Past") ?? null;
  const shown = [upcoming, current, past].filter(Boolean) as Event[];

  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 30 });

  const n = shown.length;
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

  if (n === 0) return null;

  const event = shown[index];

  return (
    <section className="relative bg-[#11100e] py-12 text-[#f4f1ea] md:hidden" ref={containerRef}>
      <div className="room-shell mb-6">
        <p className="section-kicker text-white/50">Events</p>
        <h2 className="room-serif mt-2 text-3xl font-medium leading-none">At ROOM</h2>
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
            key={event.slug}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <Link href={`/events/${event.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden bg-[#0c0c0b]">
                {event.image ? (
                  <PositionedImage
                    src={event.image}
                    alt={event.title}
                    transform={event.heroTransform}
                    containerClassName="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <p className="room-serif text-sm text-white/30">No image</p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#11100e]/90 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">
                      {event.status}
                    </span>
                  </div>
                  <h3 className="room-serif mt-2 text-3xl leading-tight text-[#f4f1ea]">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/60">{event.date}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {canSwipe && (
        <div className="room-shell mt-8 flex items-center justify-between">
          <div className="flex gap-2">
            {shown.map((_, i) => (
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
          <p className="text-xs text-white/50">
            {index + 1} / {n}
          </p>
        </div>
      )}

      <div className="room-shell mt-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea] transition hover:bg-white/10"
        >
          All events <ArrowUpRight size={14} />
        </Link>
      </div>
    </section>
  );
}
