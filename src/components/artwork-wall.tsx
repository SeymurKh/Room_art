"use client";

import { useRef, useState, useEffect } from "react";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Artwork, SiteSettings } from "@/lib/types";
import { whatsappArtworkUrl } from "@/lib/whatsapp";
import { ArtworkFrame } from "@/components/artwork-frame";
import { MobileMagnifier } from "@/components/mobile-magnifier";

// Акт 1 — картина «поднимается со спины на ноги»:
// из положения лёжа (rotateX) встаёт вертикально на своё место на стене
const frameVariants: Variants = {
  initial: { opacity: 0, rotateX: 50, y: 48 },
  animate: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
  },
};

// Акт 3 — надписи появляются последними
const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 1.1,
    },
  },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

export function ArtworkWall({
  artwork,
  artist,
  settings,
}: {
  artwork: Artwork;
  artist: string;
  settings: SiteSettings;
}) {
  const priceLabel = artwork.priceAzn != null ? `${artwork.priceAzn.toLocaleString("en-US")} AZN` : null;
  const wallRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

  return (
    <section
      ref={wallRef}
      className="grid min-h-screen grid-rows-[auto_1fr_auto] pt-16"
      style={{
        backgroundImage: "url('/assets/room-wall.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-black/45" aria-hidden="true" />
      {/* Top header info */}
      <motion.header
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="room-shell flex flex-col items-center gap-4 py-5 text-center md:flex-row md:items-start md:justify-between md:gap-6 md:py-6 md:text-left"
      >
        <motion.div variants={fadeUp}>
          <p className="section-kicker text-white/60">{artist}</p>
          <h1 className="room-serif mt-2 max-w-md text-3xl font-medium leading-[0.95] text-[#f4f1ea] md:text-5xl">
            {artwork.title}
          </h1>
        </motion.div>
        <motion.div variants={fadeUp} className="flex flex-col items-center gap-3 md:flex-row md:items-start md:gap-6">
          <div className="flex items-center gap-2">
            {([1, 1.4, 1.8] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScale(s)}
                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                  scale === s
                    ? "bg-[#f4f1ea] text-[#11100e]"
                    : "bg-white/10 text-white/60 hover:bg-white/15"
                }`}
              >
                x{s === 1 ? "1" : s === 1.4 ? "2" : "3"}
              </button>
            ))}
          </div>
          <div className="text-right">
            {artwork.year ? <p className="text-sm text-white/60">{artwork.year}</p> : null}
            <p className="mt-1 text-sm text-white/60">{artwork.medium}</p>
          </div>
        </motion.div>
      </motion.header>

      {/* Center artwork on the venue wall */}
      <div className="flex items-center justify-center overflow-hidden px-4 py-2">
        <div className="relative w-fit">
          <motion.div
            ref={imageRef}
            variants={frameVariants}
            initial="initial"
            animate="animate"
            className="relative z-10"
            style={{ transformOrigin: "center bottom" }}
          >
            <ArtworkFrame artwork={artwork} priority enableLens scale={scale} />
          </motion.div>
        </div>
      </div>

      {isMobile && wallRef.current && (
        <MobileMagnifier
          imageUrl={artwork.image}
          imageRef={imageRef}
          containerRef={wallRef}
          scale={scale}
        />
      )}

      {/* Bottom / side details */}
      <motion.footer
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="room-shell flex flex-col items-center justify-center gap-6 py-5 text-center md:flex-row md:items-end md:justify-between md:py-6 md:text-left"
      >
        <motion.div variants={fadeUp}>
          <dl className="grid grid-cols-3 gap-x-3 gap-y-2 justify-items-center text-xs sm:gap-x-8 sm:text-sm md:justify-items-start">
            <div>
              <dt className="text-white/50">Dimensions</dt>
              <dd className="mt-0.5 text-[#f4f1ea]">{artwork.dimensions}</dd>
            </div>
            <div>
              <dt className="text-white/50">Availability</dt>
              <dd className="mt-0.5 text-[#f4f1ea]">{artwork.availability}</dd>
            </div>
            {priceLabel ? (
              <div>
                <dt className="text-white/50">Price</dt>
                <dd className="mt-0.5 text-[#f4f1ea]">{priceLabel}</dd>
              </div>
            ) : null}
          </dl>
        </motion.div>

        <motion.div variants={fadeUp}>
          <a
            href={whatsappArtworkUrl(settings, artwork)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#11100e] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea] transition hover:bg-[#11100e]/85"
          >
            Inquire on WhatsApp <ArrowUpRight size={16} />
          </a>
        </motion.div>
      </motion.footer>
    </section>
  );
}
