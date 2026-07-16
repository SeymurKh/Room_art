"use client";

import { useRef, useState } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";
import type { Artwork } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

type GalleryScrolltellingProps = {
  artworks: Artwork[];
};

/**
 * Scrolltelling gallery — сцена-стена.
 * Одно скролл-движение = одна полная смена картины с плавным fade.
 */
export function GalleryScrolltelling({ artworks }: GalleryScrolltellingProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const n = artworks.length;
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setActiveIndex(Math.min(Math.floor(progress * n), n - 1));
  });

  // scaleFactor — как в artwork-wall
  function scaleFactor(widthCm: number, heightCm: number): number {
    const maxDim = Math.max(widthCm, heightCm);
    return 0.55 + (maxDim / 140) * 0.45;
  }

  return (
    <div ref={containerRef} style={{ height: `${n * 40}vh` }}>
      <section
        className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/assets/wall-interior.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Текст-табличка внизу */}
        <div className="pointer-events-none absolute bottom-8 left-0 right-0 z-30 text-center">
          <p className="room-serif text-base italic text-[#6f6a61] md:text-lg">
            What's currently on display at ROOM
          </p>
        </div>

        {artworks.map((artwork, i) => {
          const aspect = artwork.widthCm / artwork.heightCm;
          const isPortrait = aspect < 1;
          const sf = scaleFactor(artwork.widthCm, artwork.heightCm);
          const baseWidth = isPortrait ? `${40 * sf}vw` : `${65 * sf}vw`;
          const maxWidth = isPortrait ? `${420 * sf}px` : `${700 * sf}px`;
          const borderWidth = `${Math.round(10 + sf * 10)}px`;

          return (
            <div
              key={artwork.slug}
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{
                opacity: i === activeIndex ? 1 : 0,
                transition: "opacity 0.5s ease",
              }}
            >
              <div
                className="gallery-shadow relative border-[#11100e] bg-black"
                style={{
                  width: `min(${baseWidth}, ${maxWidth})`,
                  aspectRatio: `${artwork.widthCm} / ${artwork.heightCm}`,
                  borderWidth,
                }}
              >
                <RoomImage
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  priority
                  className="object-cover"
                  fallbackText={artwork.title}
                />
              </div>
              {/* Тень под картиной */}
              <div className="absolute bottom-10 left-1/2 h-9 w-[62%] -translate-x-1/2 rounded-full bg-black/22 blur-2xl" />
            </div>
          );
        })}
      </section>
    </div>
  );
}