"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import type { Artist } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

const CARD_W = 280;
const CARD_W_MOBILE = 260;
const GAP = 24;
const AUTOPLAY_DELAY = 4000;
const RESUME_DELAY = 5000;
const EDGE = 3.25; // cards farther from the center are not rendered

function useWindowWidth() {
  const [width, setWidth] = useState(1440);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const update = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setWidth(window.innerWidth), 150);
    };
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      clearTimeout(timer);
    };
  }, []);
  return width;
}

// Shortest signed distance between two positions on the loop.
function circularOffset(index: number, active: number, n: number): number {
  const half = n / 2;
  return ((((index - active + half) % n) + n) % n) - half;
}

export function ArtistsCarousel({ artists, dark = false }: { artists: Artist[]; dark?: boolean }) {
  const width = useWindowWidth();
  const isMobile = width < 640;
  const cardW = isMobile ? CARD_W_MOBILE : CARD_W;
  const gap = isMobile ? 16 : GAP;
  const n = artists.length;
  const canNavigate = n > 1;

  // Unbounded position: it only increments/decrements, so every slide is a
  // continuous one-step move and the loop never "snaps" back to the start.
  const [position, setPosition] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (!canNavigate) return;
      setPosition((p) => p + circularOffset(index, p, n));
    },
    [canNavigate, n],
  );

  const goNext = useCallback(() => {
    if (!canNavigate) return;
    setPosition((p) => p + 1);
  }, [canNavigate]);

  const goPrev = useCallback(() => {
    if (!canNavigate) return;
    setPosition((p) => p - 1);
  }, [canNavigate]);

  const pause = useCallback(() => {
    setPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setPaused(false), RESUME_DELAY);
  }, []);

  useEffect(() => {
    if (!canNavigate || paused) return;
    autoplayTimerRef.current = setInterval(() => {
      setPosition((p) => p + 1);
    }, AUTOPLAY_DELAY);
    return () => {
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
    };
  }, [canNavigate, paused]);

  const dragStartRef = useRef<{ x: number; id: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!canNavigate) return;
      dragStartRef.current = { x: e.clientX, id: e.pointerId };
    },
    [canNavigate],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragStartRef.current || dragStartRef.current.id !== e.pointerId) return;
      const dx = e.clientX - dragStartRef.current.x;
      dragStartRef.current = null;
      const threshold = cardW / 3;
      if (dx < -threshold) goNext();
      else if (dx > threshold) goPrev();
      pause();
    },
    [cardW, goNext, goPrev, pause],
  );

  const handlePointerLeave = useCallback(() => {
    dragStartRef.current = null;
  }, []);

  if (n === 0) return null;

  const activeIndex = ((position % n) + n) % n;
  const titleColor = dark ? "text-[#f4f1ea]" : "text-[#11100e]";
  const subColor = dark ? "text-white/60" : "text-[#6f6a61]";

  // Every artist is rendered as up to three copies around the loop; with the
  // unbounded position all copies slide continuously, and the duplicates stay
  // hidden behind the masked viewport edges.
  const copies = canNavigate ? [-1, 0, 1] : [0];

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
          goPrev();
          pause();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          goNext();
          pause();
        }
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = setTimeout(() => setPaused(false), RESUME_DELAY);
      }}
    >
      {canNavigate && (
        <>
          <button
            type="button"
            onClick={() => {
              goPrev();
              pause();
            }}
            className="absolute -left-2 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-black/12 bg-white/80 p-3 shadow-md backdrop-blur transition hover:bg-white md:-left-12 md:block"
            aria-label="Previous artist"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => {
              goNext();
              pause();
            }}
            className="absolute -right-2 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border border-black/12 bg-white/80 p-3 shadow-md backdrop-blur transition hover:bg-white md:-right-12 md:block"
            aria-label="Next artist"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      <div className="overflow-hidden" style={{ height: cardW * 1.85, perspective: 1200 }}>
        <div
          className="relative h-full"
          style={{
            transformStyle: "preserve-3d",
            cursor: canNavigate ? "grab" : "default",
            touchAction: "pan-y",
            userSelect: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          {artists.map((artist, i) =>
            copies.map((k) => {
              const pos = i + k * n - position;
              const dist = Math.abs(pos);
              if (dist > EDGE) return null;
              const isCenter = dist === 0;
              const clampedDist = Math.min(dist, 3);
              const scale = 1 - clampedDist * 0.08;
              const opacity = 1 - clampedDist * 0.25;
              const translateZ = -clampedDist * 25;

              return (
                <div
                  key={`${artist.slug}:${k}`}
                  className="absolute top-1/2"
                  style={{
                    left: "50%",
                    width: `${cardW}px`,
                    marginLeft: `${-cardW / 2}px`,
                    transform: `translateY(-50%) translateX(${pos * (cardW + gap)}px) scale(${scale}) translateZ(${translateZ}px)`,
                    opacity,
                    willChange: "transform",
                    transition:
                      "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                    zIndex: 10 - clampedDist,
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
                      className="relative aspect-3/4 overflow-hidden rounded-3xl bg-black shadow-2xl"
                      style={{ transform: "translateZ(0)" }}
                    >
                      <RoomImage
                        src={artist.portrait}
                        alt={artist.name}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105 grayscale"
                        style={{ willChange: "filter" }}
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
                      <div className="mt-5 flex items-start justify-between gap-4 px-1">
                        <div>
                          <p className={`text-sm font-semibold uppercase tracking-[0.12em] ${titleColor}`}>
                            {artist.name}
                          </p>
                          <p className={`mt-1 text-sm ${subColor}`}>{artist.role}</p>
                        </div>
                        <ArrowUpRight size={18} className="opacity-30 transition group-hover:opacity-100" />
                      </div>
                    )}
                  </Link>
                </div>
              );
            }),
          )}
        </div>
      </div>

      {canNavigate && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {artists.map((artist, i) => (
            <button
              key={artist.slug}
              type="button"
              onClick={() => {
                goTo(i);
                pause();
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex
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