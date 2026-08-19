"use client";

import { useRef } from "react";
import Link from "next/link";
import { useScroll, motion, useTransform, useSpring, useMotionValue, useMotionValueEvent } from "framer-motion";
import { PositionedImage } from "@/components/positioned-image";
import type { Event } from "@/lib/types";

type EventsScrolltellingProps = { events: Event[] };

export const STRIPES: { key: "Upcoming" | "Past"; clipPath: string; align: "left" | "right" }[] = [
  { key: "Upcoming", clipPath: "polygon(0 0, 45% 0, 55% 100%, 0 100%)", align: "left" },
  { key: "Past", clipPath: "polygon(55% 0, 100% 0, 100% 100%, 45% 100%)", align: "right" },
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

  const target = useMotionValue(0);
  const smoothProgress = useSpring(target, { stiffness: 80, damping: 35 });

  const pastOpacity = useTransform(smoothProgress, (p) => {
    if (p <= 0) return 0;
    if (p >= 0.5) return 1;
    return p * 2;
  });
  const opacities = [1, pastOpacity];

  useMotionValueEvent(scrollYProgress, "change", (p) => target.set(p));

  const scrolled = [
    findFeaturedEvent(events, "Upcoming"),
    findFeaturedEvent(events, "Past"),
  ] as const;

  return (
    <div ref={containerRef} className="relative hidden md:block" style={{ height: "240vh" }}>
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
                  <div
                    className={`absolute inset-x-0 bottom-0 z-10 flex items-end px-8 pb-16 md:px-12 md:pb-20 ${
                      stripe.align === "right" ? "justify-end text-right" : "justify-start text-left"
                    }`}
                  >
                    <div className="max-w-md">
                      <p className="section-kicker text-[#f4f1ea]/60">{stripe.key}</p>
                      <p className="room-serif mt-3 text-3xl leading-tight text-[#f4f1ea] transition-transform duration-500 group-hover:-translate-y-1 md:text-4xl">
                        {event.title}
                      </p>
                      <p className="section-kicker mt-3 text-[#f4f1ea]/60">{event.date}</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex h-full items-center justify-center opacity-20">
                  <p className="room-serif text-sm text-white/30">No {stripe.key.toLowerCase()} events</p>
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

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-32 bg-linear-to-b from-transparent to-[#ebe7df]" />
    </div>
  );
}

export function MobileEventsScrolltelling({ events }: EventsScrolltellingProps) {
  const upcoming = findFeaturedEvent(events, "Upcoming");
  const past = findFeaturedEvent(events, "Past");
  const shown = [upcoming, past].filter(Boolean) as Event[];

  if (shown.length === 0) return null;

  return (
    <section className="bg-[#11100e] py-12 md:hidden">
      <div className="room-shell mb-8">
        <p className="section-kicker text-white/50">Events at ROOM</p>
      </div>
      <div className="room-shell grid gap-6">
        {shown.map((event) => (
          <Link
            key={event.slug}
            href={`/events/${event.slug}`}
            className="group relative block aspect-[4/3] overflow-hidden bg-[#0c0c0b]"
          >
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
            <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#11100e]/90 via-[#11100e]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="section-kicker text-white/60">{event.status}</p>
              <p className="room-serif mt-2 text-2xl leading-tight text-[#f4f1ea]">{event.title}</p>
              <p className="mt-1 text-sm text-white/60">{event.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
