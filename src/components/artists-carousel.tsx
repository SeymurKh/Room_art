"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import type { Artist } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

type ArtistsCarouselProps = {
  artists: Artist[];
  dark?: boolean;
};

const CARD_W = 280;
const CARD_W_MOBILE = 200;
const RADIUS = 760;
const RADIUS_MOBILE = 340;
const TOTAL_ARC_DEG = 110;
const AUTOPLAY_DELAY = 4000;
const RESUME_DELAY = 5000;
const VISIBLE_SLOTS = 5;

function useWindowWidth() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return width;
}

function slotPosition(offset: number, totalSlots: number, radius: number) {
  const angleStep = totalSlots > 1 ? TOTAL_ARC_DEG / (totalSlots - 1) : 0;
  const deg = offset * angleStep;
  const rad = (deg * Math.PI) / 180;

  const translateX = radius * Math.sin(rad);
  const translateZ = -radius * (1 - Math.cos(rad));
  const rotateY = deg;

  const absFrac = totalSlots > 1 ? Math.abs(offset) / ((totalSlots - 1) / 2) : 0;
  const scale = 1.0 - absFrac * 0.35;
  const opacity = 1.0 - absFrac * 0.65;

  return { translateX, translateZ, rotateY, scale, opacity };
}

export function ArtistsCarousel({ artists, dark = false }: ArtistsCarouselProps) {
  const width = useWindowWidth();
  const isMobile = width < 640;
  const cardW = isMobile ? CARD_W_MOBILE : CARD_W;
  const radius = isMobile ? RADIUS_MOBILE : RADIUS;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const n = artists.length;
  const canNavigate = n > 1;
  const half = Math.floor(VISIBLE_SLOTS / 2);

  const goTo = useCallback((nextActive: number) => {
    if (!canNavigate) return;
    setActive((nextActive % n + n) % n);
  }, [canNavigate, n]);

  const next = useCallback(() => goTo(active + 1), [goTo, active]);
  const prev = useCallback(() => goTo(active - 1), [goTo, active]);

  const pause = useCallback(() => {
    setPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setPaused(false), RESUME_DELAY);
  }, []);

  // Autoplay
  useEffect(() => {
    if (!canNavigate || paused) return;
    autoplayTimerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % n);
    }, AUTOPLAY_DELAY);
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [canNavigate, paused, n]);

  // Drag handling
  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 140, damping: 24, mass: 0.8 });

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = cardW / 3;
    if (info.offset.x < -threshold) {
      next();
    } else if (info.offset.x > threshold) {
      prev();
    }
    x.set(0);
    pause();
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    x.set(info.offset.x * 0.4);
  };

  // Build visible cards around active index
  const cards = [];
  for (let offset = -half; offset <= half; offset++) {
    const idx = ((active + offset) % n + n) % n;
    cards.push({ artist: artists[idx], offset, key: active + offset });
  }

  return (
    <div
      className="relative mx-auto select-none focus:outline-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Artists carousel"
      tabIndex={0}
      onKeyDown={(e) => {
        if (!canNavigate) return;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          prev();
          pause();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          next();
          pause();
        }
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = setTimeout(() => setPaused(false), RESUME_DELAY);
      }}
    >
      {/* Navigation arrows */}
      {canNavigate && (
        <>
          <button
            type="button"
            onClick={() => { prev(); pause(); }}
            className="absolute -left-2 top-1/2 z-30 -translate-y-1/2 rounded-full border border-black/12 bg-white/80 p-3 shadow-md backdrop-blur transition hover:bg-white md:-left-12"
            aria-label="Previous artist"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => { next(); pause(); }}
            className="absolute -right-2 top-1/2 z-30 -translate-y-1/2 rounded-full border border-black/12 bg-white/80 p-3 shadow-md backdrop-blur transition hover:bg-white md:-right-12"
            aria-label="Next artist"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* 3D stage */}
      <div
        className="relative mx-auto flex items-center justify-center overflow-hidden"
        style={{
          perspective: 1000,
          height: cardW * 1.85,
        }}
      >
        <motion.div
          className="relative flex items-center justify-center"
          style={{
            x: springX,
            width: cardW,
            height: cardW * 1.4,
            transformStyle: "preserve-3d",
            cursor: canNavigate ? "grab" : "default",
            willChange: "transform",
          }}
          drag={canNavigate ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => {
            if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = setTimeout(() => setPaused(false), RESUME_DELAY);
          }}
        >
          {cards.map(({ artist, offset, key }) => {
            const pos = slotPosition(offset, VISIBLE_SLOTS, radius);
            const isCenter = offset === 0;

            return (
              <motion.div
                key={key}
                className="absolute left-0 top-0"
                style={{ width: cardW, transformStyle: "preserve-3d" }}
                animate={{
                  x: pos.translateX,
                  z: pos.translateZ,
                  rotateY: pos.rotateY,
                  scale: pos.scale,
                  opacity: pos.opacity,
                  zIndex: 10 - Math.abs(offset),
                }}
                  transition={{
                  type: "spring",
                  stiffness: 110,
                  damping: 22,
                  mass: 0.9,
                }}
              >
                <Link
                  href={`/artists/${artist.slug}`}
                  className="group block"
                  tabIndex={isCenter ? 0 : -1}
                  aria-label={isCenter ? `${artist.name}, ${artist.role}` : undefined}
                  aria-hidden={!isCenter}
                >
                  <div
                    className="relative aspect-3/4 overflow-hidden bg-black shadow-2xl"
                    style={{ transform: "translateZ(0)" }}
                  >
                    <RoomImage
                      src={artist.portrait}
                      alt={artist.name}
                      fill
                      className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                      fallbackText={artist.name}
                      sizes="(max-width: 640px) 70vw, 280px"
                    />
                    {isCenter && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm uppercase tracking-[0.14em] text-white opacity-0 transition duration-500 group-hover:bg-black/30 group-hover:opacity-100">
                        View artist
                      </span>
                    )}
                  </div>
                  {isCenter && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="mt-5 flex items-start justify-between gap-4 px-1"
                    >
                      <div>
                        <p className={`text-sm font-semibold uppercase tracking-[0.12em] ${dark ? "text-[#f4f1ea]" : ""}`}>
                          {artist.name}
                        </p>
                        <p className={`mt-1 text-sm ${dark ? "text-white/60" : "text-[#6f6a61]"}`}>{artist.role}</p>
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
        </motion.div>
      </div>

      {/* Dots indicator */}
      {canNavigate && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {artists.map((artist, i) => (
            <button
              key={artist.slug}
              type="button"
              onClick={() => { goTo(i); pause(); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active
                    ? dark
                      ? "w-6 bg-[#f4f1ea]"
                      : "w-6 bg-[#11100e]"
                    : dark
                      ? "w-1.5 bg-[#f4f1ea]/30"
                      : "w-1.5 bg-[#11100e]/20"
                }`}
              aria-label={`Go to ${artist.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
