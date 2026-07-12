"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type ParallaxWindowProps = {
  src: string;
  alt?: string;
  /** Высота изображения в процентах от контейнера (должна быть > 100) */
  imageHeight?: number;
  /** Сила параллакса — доля от избыточной высоты (0..1) */
  parallaxStrength?: number;
  /** Дополнительные классы для секции */
  className?: string;
  children: ReactNode;
};

/**
 * Секция с параллакс-фоном — «окно в комнату».
 *
 * Изображение выше контейнера (например 300%).
 * При скролле top смещается от -200% до 0%.
 * overflow: hidden гарантирует, что края изображения никогда не видны —
 * в начале скрыт нижний край, в конце скрыт верхний.
 */
export function ParallaxWindow({
  src,
  alt = "",
  imageHeight = 300,
  parallaxStrength = 1,
  className = "",
  children,
}: ParallaxWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Избыток над 100%, например 200% при imageHeight=300
  const excess = imageHeight - 100;
  // Начальное положение: фото ближе к центру, по 100% скрыто сверху и снизу
  const startTop = `-${excess / 2}%`; // например -100%
  // Конечное положение: верх фото = верх секции, низ фото убран за низ
  const endTop = "0%";

  const top = useTransform(
    scrollYProgress,
    [0, 1],
    [startTop, `${parseFloat(endTop) * parallaxStrength}%`]
  );

  // Zoom: от приближения к нормальному масштабу при скролле вниз
  const scale = useTransform(scrollYProgress, [0, 1], [1.25, 1]);

  return (
    <section
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Параллакс-изображение */}
      <motion.div
        className="absolute inset-0"
        style={{ top, scale }}
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          style={{ height: `${imageHeight}%` }}
        />
      </motion.div>

      {/* Затемнение для читабельности */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Контент */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}