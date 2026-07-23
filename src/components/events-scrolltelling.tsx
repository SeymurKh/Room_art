"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll, motion, useTransform } from "framer-motion";
import { PositionedImage } from "@/components/positioned-image";
import type { Exhibition } from "@/lib/types";

type EventsScrolltellingProps = { exhibitions: Exhibition[] };

export const STRIPES = [
  { key: "Upcoming" as const, clipPath: "polygon(0 0, 40% 0, 20% 100%, 0 100%)" },
  { key: "Current" as const, clipPath: "polygon(40% 0, 80% 0, 60% 100%, 20% 100%)" },
  { key: "Past" as const, clipPath: "polygon(80% 0, 100% 0, 100% 100%, 60% 100%)" },
];

function findFeaturedEvent(exhibitions: Exhibition[], status: Exhibition["status"]) {
  const matches = exhibitions.filter((e) => e.status === status);
  return matches.find((e) => e.featured) ?? matches[0] ?? null;
}

export function EventsScrolltelling({ exhibitions }: EventsScrolltellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // First stripe visible immediately, second fades in over first half of scroll
  // and stays visible, third fades in over second half and stays visible.
  const secondOpacity = useTransform(scrollYProgress, (p) => {
    if (p <= 0) return 0;
    if (p >= 0.5) return 1;
    return p * 2;
  });
  const thirdOpacity = useTransform(scrollYProgress, (p) => {
    if (p <= 0.5) return 0;
    if (p >= 1) return 1;
    return (p - 0.5) * 2;
  });
  const opacities = [1, secondOpacity, thirdOpacity];

  const events = [
    findFeaturedEvent(exhibitions, "Upcoming"),
    findFeaturedEvent(exhibitions, "Current"),
    findFeaturedEvent(exhibitions, "Past"),
  ] as const;

  return (
    <div ref={containerRef} className="relative" style={{ height: "240vh" }}>
      <section className="sticky top-0 h-screen overflow-hidden bg-[#11100e]">
        {STRIPES.map((stripe, i) => {
          const event = events[i];
          const opacity = opacities[i];
          return (
            <motion.div
              key={stripe.key}
              className="absolute inset-0"
              style={{ clipPath: stripe.clipPath, opacity }}
            >
              {event ? (
                <Link
                  href={`/events/${event.slug}`}
                  className="group relative block h-full w-full"
                >
                  <div className="absolute inset-0">
                    {event.image ? (
                      <PositionedImage
                        src={event.image}
                        alt={event.title}
                        transform={event.heroTransform}
                        containerClassName="h-full w-full"
                        clipPath={stripe.clipPath}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#11100e]">
                        <p className="room-serif text-sm text-white/30">No image</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-12 left-0 right-0 z-10 flex flex-col items-center gap-3 px-6 text-center" style={{ clipPath: stripe.clipPath }}>
                    <p className="room-serif text-2xl leading-tight text-[#f4f1ea] transition-transform duration-500 group-hover:-translate-y-1 md:text-3xl">
                      {event.title}
                    </p>
                    <p className="section-kicker text-[#f4f1ea]/60">{event.date}</p>
                  </div>
                </Link>
              ) : (
                <div className="flex h-full items-center justify-center opacity-20">
                  <p className="room-serif text-sm text-white/30">No events</p>
                </div>
              )}
            </motion.div>
          );
        })}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-30 text-center">
          <p className="room-serif text-sm italic text-[#f4f1ea]/25 md:text-base">
            Exhibitions & events at ROOM
          </p>
        </div>
      </section>
    </div>
  );
}
