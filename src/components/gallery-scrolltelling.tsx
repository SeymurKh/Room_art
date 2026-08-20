"use client";

import { useRef, useState, useCallback } from "react";
import { useScroll, useSpring, useMotionValue, useMotionValueEvent } from "framer-motion";
import { SkipForward } from "lucide-react";
import type { Artwork } from "@/lib/types";
import { ArtworkFrame } from "@/components/artwork-frame";

type GalleryScrolltellingProps = {
  artworks: Artwork[];
};

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

/**
 * Scrolltelling gallery — сцена-стена.
 * Инерционный скролл с кроссфейдом и снапом к ближайшей картине при остановке.
 */
export function GalleryScrolltelling({ artworks }: GalleryScrolltellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // target для spring — сырой прогресс, который потом снапится
  const target = useMotionValue(0);
  const smoothProgress = useSpring(target, { stiffness: 80, damping: 35 });

  const n = artworks.length;
  const [progress, setProgress] = useState(0);

  // Читаем сглаженный прогресс для отображения
  useMotionValueEvent(smoothProgress, "change", (p) => {
    setProgress(clamp(p, 0, 1));
  });

  // Обновляем target при скролле
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    // Очищаем предыдущий таймер снапа
    if (snapTimerRef.current) {
      clearTimeout(snapTimerRef.current);
    }

    // Пока скроллим — target идёт за скроллом
    target.set(p);

    // Ставим таймер на снап через 300ms после остановки
    snapTimerRef.current = setTimeout(() => {
      if (n === 1) return;
      const snapped = Math.round(p * (n - 1)) / (n - 1);
      target.set(clamp(snapped, 0, 1));
    }, 300);
  });

  const progressPercent = Math.round(progress * 100);

  const handleSkip = useCallback(() => {
    if (!containerRef.current || n <= 1) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const targetScroll = window.scrollY + containerRect.bottom - viewportHeight;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  }, [n]);

  return (
    <div ref={containerRef} className="relative" style={{ height: n <= 1 ? "100vh" : `${n * 80}vh` }}>
      <section
        className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/assets/room-wall.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Затемняющий оверлей поверх фона, под картинами */}
        <div className="pointer-events-none absolute inset-0 bg-black/45" aria-hidden="true" />

        {/* Картины — непрерывный кроссфейд */}
        {artworks.map((artwork, i) => {
          // Центр картины i: от 0 (первая) до 1 (последняя), равномерно
          const center = n === 1 ? 0.5 : i / (n - 1);
          // Расстояние до центра в долях шага (1/(n-1))
          const dist = n === 1 ? 0 : Math.abs(progress - center) * (n - 1);
          // Треугольный профиль: opacity = 1 в центре, 0 у соседа
          const opacity = Math.max(0, 1 - dist);

          return (
            <div
              key={artwork.slug}
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{ opacity }}
            >
              <ArtworkFrame artwork={artwork} priority={i === 0} />
            </div>
          );
        })}

        {/* Одна общая тень под картиной */}
        <div className="pointer-events-none absolute bottom-10 left-1/2 h-9 w-[62%] -translate-x-1/2 rounded-full bg-black/22 blur-2xl" />

        {/* Skip button */}
        {n > 1 && (
          <button
            type="button"
            onClick={handleSkip}
            className="absolute bottom-8 right-20 z-50 flex items-center gap-2 rounded-full border border-white/30 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/90 backdrop-blur transition hover:bg-black/40"
            aria-label="Skip to next artwork"
          >
            Skip <SkipForward size={14} />
          </button>
        )}

        {/* Текст-табличка + индикатор прогресса внизу */}
        <div className="pointer-events-none absolute bottom-8 left-0 right-0 z-30 flex flex-col items-center gap-6 text-center">
          <p className="room-serif text-base italic text-[#6f6a61] md:text-lg">
            What{"'"}s currently on display at ROOM
          </p>
          {/* Индикатор прогресса — полоска с метками */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-1 w-48 items-center rounded-full bg-white/12 md:w-64">
              <div
                className="h-full rounded-full bg-[#f4f1ea]/80 transition-none"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Метки-деления для каждой картины */}
              {artworks.map((_, i) => {
                const left = n === 1 ? 50 : (i / (n - 1)) * 100;
                return (
                  <span
                    key={i}
                    className="absolute top-1/2 h-2 w-0.5 -translate-y-1/2 bg-white/50"
                    style={{ left: `${left}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Fade to the light section below */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 h-32 bg-linear-to-b from-transparent to-[#f4f1ea]" />
    </div>
  );
}