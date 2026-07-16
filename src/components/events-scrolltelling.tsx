"use client";

import { useRef, useMemo, useState } from "react";
import { useScroll, motion, useMotionValueEvent } from "framer-motion";
import type { Exhibition } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

type EventsScrolltellingProps = {
  exhibitions: Exhibition[];
};

type ColumnKey = "Upcoming" | "Current" | "Past";

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "Upcoming", label: "Upcoming" },
  { key: "Current", label: "Current" },
  { key: "Past", label: "Past" },
];

/**
 * Секция Events на весь экран: три диагональные полосы, проявляются слева направо при скролле.
 */
export function EventsScrolltelling({ exhibitions }: EventsScrolltellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const grouped = useMemo(() => {
    const map: Record<ColumnKey, Exhibition[]> = {
      Upcoming: [],
      Current: [],
      Past: [],
    };
    for (const e of exhibitions) {
      map[e.status]?.push(e);
    }
    return map;
  }, [exhibitions]);

  // Высота контейнера: 40vh на колонку (3 колонки = 120vh)
  const totalHeight = 120; // vh

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // progress делится на 3 зоны: 0-0.33 Upcoming, 0.33-0.66 Current, 0.66-1.0 Past
  const [activeColumns, setActiveColumns] = useState<Set<ColumnKey>>(new Set());

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = new Set<ColumnKey>();
    if (v >= 0) next.add("Upcoming");
    if (v >= 0.30) next.add("Current");
    if (v >= 0.60) next.add("Past");
    setActiveColumns(next);
  });

  return (
    <div ref={containerRef} style={{ height: `${totalHeight}vh` }}>
      <section className="sticky top-0 flex h-screen overflow-hidden bg-[#f4f1ea]">
        {/* Три полосы на весь экран под одним углом */}
        <div
          className="flex h-full w-full"
          style={{ transform: "rotate(-8deg)" }}
        >
          {COLUMNS.map((col) => {
            const cards = grouped[col.key];
            const isActive = activeColumns.has(col.key);

            return (
              <div
                key={col.key}
                className="flex w-1/3 flex-col justify-center border-r border-black/10 px-8"
              >
                <div className="flex flex-col gap-6">
                  {/* Заголовок колонки */}
                  <h3 className="room-serif text-lg text-[#11100e]/50 md:text-xl">
                    {col.label}
                  </h3>

                  {/* Карточки */}
                  <div className="flex flex-col gap-6">
                    {cards.map((event, cardIndex) => (
                      <motion.div
                        key={event.slug}
                        className="flex w-full max-w-[260px] flex-col gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={
                          isActive
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: 20 }
                        }
                        transition={{
                          duration: 0.5,
                          ease: "easeOut",
                          delay: isActive ? cardIndex * 0.12 : 0,
                        }}
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden bg-black/5">
                          <RoomImage
                            src={event.image}
                            alt={event.title}
                            fill
                            className="object-cover grayscale transition duration-700 hover:grayscale-0"
                            fallbackText={event.title}
                            sizes="260px"
                          />
                        </div>
                        <div>
                          <p className="room-serif text-sm leading-tight text-[#11100e] md:text-base">
                            {event.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#6f6a61]">
                            {event.date}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {/* Пустая колонка */}
                    {!isActive && cards.length === 0 && (
                      <div className="flex w-full max-w-[260px] flex-col items-center gap-3 opacity-0">
                        <div className="aspect-[3/4] w-full bg-black/5" />
                        <p className="text-xs text-[#6f6a61]">No events</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Подпись внизу */}
        <div className="pointer-events-none absolute bottom-8 left-0 right-0 z-30 text-center">
          <p className="room-serif text-base italic text-[#6f6a61]/70 md:text-lg">
            Exhibitions & events at ROOM
          </p>
        </div>
      </section>
    </div>
  );
}