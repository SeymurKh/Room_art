"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll, motion, useTransform, useSpring, useMotionValue, useMotionValueEvent } from "framer-motion";
import { PositionedImage } from "@/components/positioned-image";
import type { Event } from "@/lib/types";

type EventsScrolltellingProps = { events: Event[] };

export const STRIPES = [
  { key: "Upcoming" as const, clipPath: "polygon(0 0, 55% 0, 35% 100%, 0 100%)" },
  { key: "Past" as const, clipPath: "polygon(55% 0, 100% 0, 100% 100%, 35% 100%)" },
];

function findFeaturedEvent(events: Event[], status: Event["status"]) {
  const matches = events.filter((e) => e.status === status);
  return matches.find((e) => e.featured) ?? matches[0] ?? null;
}

export function EventsScrolltelling({ events }: EventsScrolltellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Spring-smoothed progress for inertial stripe reveals (same feel as gallery).
  const target = useMotionValue(0);
  const smoothProgress = useSpring(target, { stiffness: 80, damping: 35 });

  // Upcoming stripe is always visible; Past stripe fades in over the first
  // half of the scroll and stays visible.
  const pastOpacity = useTransform(smoothProgress, (p) => {
    if (p <= 0) return 0;
    if (p >= 0.5) return 1;
    return p * 2;
  });
  const opacities = [1, pastOpacity];

  // Keep spring target in sync with raw scroll progress.
  useMotionValueEvent(scrollYProgress, "change", (p) => target.set(p));

  const scrolled = [
    findFeaturedEvent(events, "Upcoming"),
    findFeaturedEvent(events, "Past"),
  ] as const;

  return (
    <div ref={containerRef} className="relative" style={{ height: "240vh" }}>
      {/* Fade from the light section above */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-30 h-32 bg-linear-to-b from-[#f4f1ea] to-transparent" />

      <section className="sticky top-0 h-screen overflow-hidden bg-[#11100e]">
        {STRIPES.map((stripe, i) => {
          const event = scrolled[i];
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
                  <div className="absolute inset-0 z-10 flex items-end px-6 pb-12">
                    <div className={i === 0 ? "w-1/2 text-center" : "ml-auto w-1/2 text-center"}>
                      <p className="room-serif text-2xl leading-tight text-[#f4f1ea] transition-transform duration-500 group-hover:-translate-y-1 md:text-3xl">
                        {event.title}
                      </p>
                      <p className="section-kicker mt-3 text-[#f4f1ea]/60">{event.date}</p>
                    </div>
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
            Events at ROOM
          </p>
        </div>
      </section>

      {/* Fade to the about section below */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-32 bg-linear-to-b from-transparent to-[#ebe7df]" />
    </div>
  );
}
