"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import type { Artist } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

type ArtistsCarouselProps = {
  artists: Artist[];
};

const CARD_W = 280;
const CIRCLE_RADIUS = 660; // радиус окружности в px (offset ±1 = 330px translateX)
const TOTAL_ARC_DEG = 120; // дуга 120° (шаг 30°, offset ±2 = 60°)

type Direction = "left" | "right" | null;

/**
 * Вычисляет позицию карточки на окружности по её смещению от центра.
 * Карточки размещаются на дуге окружности в 3D-пространстве (плоскость XZ).
 */
function slotPosition(offset: number, totalSlots: number) {
  // Угловой шаг: распределяем totalSlots карточек по TOTAL_ARC_DEG градусам
  const angleStep = totalSlots > 1 ? TOTAL_ARC_DEG / (totalSlots - 1) : 0;
  // Угол в градусах: центр = 0, положительные — направо, отрицательные — налево
  const deg = offset * angleStep;
  const rad = (deg * Math.PI) / 180;

  const translateX = CIRCLE_RADIUS * Math.sin(rad);
  const translateZ = -CIRCLE_RADIUS * (1 - Math.cos(rad));
  const rotateY = deg;

  // Масштаб плавно убывает от центра (1.0) к краям (0.45)
  const absFrac = totalSlots > 1 ? Math.abs(offset) / ((totalSlots - 1) / 2) : 0;
  const scale = 1.0 - absFrac * 0.55;

  return { scale, translateX, translateZ, rotateY };
}

/**
 * 3D-карусель художников.
 * Жёстко закреплённые позиции, центральная карточка впереди.
 * При смене индекса позиции карточек обновляются.
 */
export function ArtistsCarousel({ artists }: ArtistsCarouselProps) {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState<Direction>(null);

  // Слотов ровно столько же, сколько художников
  const visibleSlots = artists.length;

  const prev = useCallback(() => {
    setDirection("left");
    setActive((a) => (a - 1 + artists.length) % artists.length);
  }, [artists.length]);

  const next = useCallback(() => {
    setDirection("right");
    setActive((a) => (a + 1) % artists.length);
  }, [artists.length]);

  const half = Math.floor(visibleSlots / 2);

  // Получаем карточки, которые должны быть видны
  const cards = [];
  for (let offset = -half; offset <= half; offset++) {
    const idx = ((active + offset) % artists.length + artists.length) % artists.length;
    cards.push({ artist: artists[idx], offset });
  }

  const posCache = new Map<number, ReturnType<typeof slotPosition>>();
  const getPos = (offset: number) => {
    const cached = posCache.get(offset);
    if (cached) return cached;
    const pos = slotPosition(offset, visibleSlots);
    posCache.set(offset, pos);
    return pos;
  };

  return (
    <div className="relative mx-auto max-w-[1300px]">
      {/* Кнопки */}
      <button
        type="button"
        onClick={prev}
        className="absolute -left-6 top-1/2 z-20 -translate-y-1/2 rounded-full border border-black/12 bg-white/80 p-3 shadow-md backdrop-blur transition hover:bg-white md:-left-12"
        aria-label="Previous artist"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute -right-6 top-1/2 z-20 -translate-y-1/2 rounded-full border border-black/12 bg-white/80 p-3 shadow-md backdrop-blur transition hover:bg-white md:-right-12"
        aria-label="Next artist"
      >
        <ChevronRight size={20} />
      </button>

      {/* 3D-сцена */}
      <div
        className="relative mx-auto flex h-[620px] items-center justify-center"
        style={{ perspective: 1200 }}
      >
        <AnimatePresence mode="popLayout" custom={direction}>
          {cards.map(({ artist, offset }) => {
            const pos = getPos(offset);
            const key = `${offset}-${artist.slug}`;

            return (
              <motion.div
                key={key}
                className="absolute"
                style={{ width: CARD_W, zIndex: 100 - Math.abs(offset) }}
                custom={direction}
                variants={{
                  enter: (dir: Direction) => ({
                    x: pos.translateX + (dir === "right" ? 150 : -150),
                    scale: pos.scale - 0.1,
                    rotateY: pos.rotateY - (dir === "right" ? 10 : -10),
                    opacity: 0,
                  }),
                  center: {
                    x: pos.translateX,
                    scale: pos.scale,
                    rotateY: pos.rotateY,
                    z: pos.translateZ,
                    opacity: 1,
                  },
                  exit: (dir: Direction) => ({
                    x: pos.translateX - (dir === "right" ? 150 : -150),
                    scale: pos.scale - 0.1,
                    rotateY: pos.rotateY + (dir === "right" ? 10 : -10),
                    opacity: 0,
                    transition: { duration: 0.35 },
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 20,
                  mass: 1.2,
                }}
              >
                <Link
                  href={`/artists/${artist.slug}`}
                  className="group block"
                  tabIndex={offset === 0 ? 0 : -1}
                >
                  <div className="card-img-overlay relative aspect-[3/4] overflow-hidden bg-black">
                    <RoomImage
                      src={artist.portrait}
                      alt={artist.name}
                      fill
                      className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                      fallbackText={artist.name}
                      sizes="320px"
                    />
                    {offset === 0 && (
                      <span className="overlay-text opacity-0 group-hover:opacity-100">
                        View artist
                      </span>
                    )}
                  </div>
                  {offset === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.12em]">
                          {artist.name}
                        </p>
                        <p className="mt-1 text-sm text-[#6f6a61]">
                          {artist.role}
                        </p>
                      </div>
                      <ArrowUpRight
                        size={18}
                        className="opacity-30 transition group-hover:opacity-100"
                      />
                    </motion.div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}