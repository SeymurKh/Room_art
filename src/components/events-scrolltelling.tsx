"use client";

import { useRef, useState } from "react";
import { useScroll, motion, useMotionValueEvent } from "framer-motion";
import type { Exhibition } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

type EventsScrolltellingProps = {
  exhibitions: Exhibition[];
};

type ColumnKey = "Upcoming" | "Current" | "Past";

type StripeDef = {
  key: ColumnKey;
  label: string;
  clipPath: string;
};

// Две параллельные линии (снизу-слева → вверх-направо):
const STRIPES: StripeDef[] = [
  {
    key: "Upcoming",
    label: "Upcoming",
    clipPath: "polygon(0 0, 40% 0, 20% 100%, 0 100%)",
  },
  {
    key: "Current",
    label: "Current",
    clipPath: "polygon(40% 0, 80% 0, 60% 100%, 20% 100%)",
  },
  {
    key: "Past",
    label: "Past",
    clipPath: "polygon(80% 0, 100% 0, 100% 100%, 60% 100%)",
  },
];

/**
 * Секция Events: страница разрезана двумя диагональными линиями.
 * Скролл останавливается на секции, колонны проявляются по очереди.
 */
export function EventsScrolltelling({ exhibitions }: EventsScrolltellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const n = 3; // three columns

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setActiveIndex(Math.min(Math.floor(progress * n + 0.01), n - 1));
  });

  // Find first event per status
  const upcoming = exhibitions.find((e) => e.status === "Upcoming") ?? null;
  const current = exhibitions.find((e) => e.status === "Current") ?? null;
  const past = exhibitions.find((e) => e.status === "Past") ?? null;

  const stripeEvents: (Exhibition | null)[] = [upcoming, current, past];

  return (
    <div ref={containerRef} style={{ height: `${n * 60}vh` }}>
      <section className="sticky top-0 h-screen overflow-hidden bg-[#11100e]">
        {STRIPES.map((stripe, i) => {
          const event = stripeEvents[i];
          const visible = i <= activeIndex;

          return (
            <div
              key={stripe.key}
              className="absolute inset-0"
              style={{ clipPath: stripe.clipPath }}
            >
              {event ? (
                <motion.div
                  className="relative h-full w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: visible ? 1 : 0 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                >
                  <div className="absolute inset-0">
                    <RoomImage
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                      fallbackText={event.title}
                      sizes="50vw"
                    />
                    <div className="absolute inset-0 bg-black/45" />
                  </div>

                  <div className="absolute bottom-12 left-0 right-0 z-10 flex flex-col items-center gap-3 px-6 text-center">
                    <p className="room-serif text-2xl leading-tight text-[#f4f1ea] md:text-3xl">
                      {event.title}
                    </p>
                    <p className="section-kicker text-[#f4f1ea]/60">{event.date}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex h-full items-center justify-center opacity-20">
                  <p className="room-serif text-sm text-white/30">No events</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Подпись */}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-30 text-center">
          <p className="room-serif text-sm italic text-[#f4f1ea]/25 md:text-base">
            Exhibitions & events at ROOM
          </p>
        </div>
      </section>
    </div>
  );
}