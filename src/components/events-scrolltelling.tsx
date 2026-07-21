"use client";

import { useRef, useState } from "react";
import { useScroll, motion, useMotionValueEvent } from "framer-motion";
import type { Exhibition } from "@/lib/types";

type EventsScrolltellingProps = { exhibitions: Exhibition[] };

const STRIPES = [
  { key: "Upcoming" as const, clipPath: "polygon(0 0, 40% 0, 20% 100%, 0 100%)" },
  { key: "Current" as const, clipPath: "polygon(40% 0, 80% 0, 60% 100%, 20% 100%)" },
  { key: "Past" as const, clipPath: "polygon(80% 0, 100% 0, 100% 100%, 60% 100%)" },
];

export function EventsScrolltelling({ exhibitions }: EventsScrolltellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const n = 3;
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => setActiveIndex(Math.min(Math.floor(p * n + 0.01), n - 1)));

  const upcoming = exhibitions.find((e) => e.status === "Upcoming") ?? null;
  const current = exhibitions.find((e) => e.status === "Current") ?? null;
  const past = exhibitions.find((e) => e.status === "Past") ?? null;
  const events = [upcoming, current, past] as const;

  return (
    <div ref={containerRef} style={{ height: `${n * 60}vh` }}>
      <section className="sticky top-0 h-screen overflow-hidden bg-[#11100e]">
        {STRIPES.map((stripe, i) => {
          const event = events[i];
          const visible = i <= activeIndex;
          return (
            <div key={stripe.key} className="absolute inset-0" style={{ clipPath: stripe.clipPath }}>
              {event ? (
                <motion.div className="relative h-full w-full" initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.55, ease: "easeOut" }}>
                  <div className="absolute inset-0">
                    {event.image ? (
                      <>
                        <img
                          src={event.image}
                          alt={event.title}
                          className="pointer-events-none select-none"
                          style={{ width: "auto", height: "auto", maxWidth: "none", transform: event.heroTransform }}
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-black/45" />
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center"><p className="room-serif text-sm text-white/30">No image</p></div>
                    )}
                  </div>
                  <div className="absolute bottom-12 left-0 right-0 z-10 flex flex-col items-center gap-3 px-6 text-center">
                    <p className="room-serif text-2xl leading-tight text-[#f4f1ea] md:text-3xl">{event.title}</p>
                    <p className="section-kicker text-[#f4f1ea]/60">{event.date}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex h-full items-center justify-center opacity-20"><p className="room-serif text-sm text-white/30">No events</p></div>
              )}
            </div>
          );
        })}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-30 text-center">
          <p className="room-serif text-sm italic text-[#f4f1ea]/25 md:text-base">Exhibitions & events at ROOM</p>
        </div>
      </section>
    </div>
  );
}