"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Artwork, SiteSettings } from "@/lib/types";
import { whatsappArtworkUrl } from "@/lib/whatsapp";
import { ArtworkFrame } from "@/components/artwork-frame";

const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const fadeIn: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: 1, ease: "easeOut" as const } },
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
  const priceLabel = artwork.priceAzn != null ? `AZN ${artwork.priceAzn.toLocaleString()}` : null;

  return (
    <section className="wall grid h-[calc(100vh-4rem)] grid-rows-[auto_1fr_auto] bg-[#f4f1ea]">
      {/* Top header info */}
      <motion.header
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="room-shell flex flex-wrap items-start justify-between gap-6 py-5 md:py-6"
      >
        <motion.div variants={fadeUp}>
          <p className="section-kicker text-[#6f6a61]">{artist}</p>
          <h1 className="room-serif mt-2 max-w-md text-3xl font-medium leading-[0.95] md:text-5xl">
            {artwork.title}
          </h1>
        </motion.div>
        <motion.div variants={fadeUp} className="text-right">
          <p className="text-sm text-[#6f6a61]">{artwork.year}</p>
          <p className="mt-1 text-sm text-[#6f6a61]">{artwork.medium}</p>
        </motion.div>
      </motion.header>

      {/* Center artwork */}
      <motion.div
        variants={fadeIn}
        initial="initial"
        animate="animate"
        className="flex items-center justify-center overflow-hidden px-4 py-2"
      >
        <ArtworkFrame artwork={artwork} priority enableLens />
      </motion.div>

      {/* Bottom / side details */}
      <motion.footer
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="room-shell flex flex-col justify-between gap-6 py-5 md:flex-row md:items-end md:py-6"
      >
        <motion.div variants={fadeUp}>
          <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2 md:grid-cols-4">
            <div>
              <dt className="text-[#6f6a61]">Dimensions</dt>
              <dd className="mt-0.5 text-[#11100e]">{artwork.dimensions}</dd>
            </div>
            <div>
              <dt className="text-[#6f6a61]">Availability</dt>
              <dd className="mt-0.5 text-[#11100e]">{artwork.availability}</dd>
            </div>
            {priceLabel ? (
              <div>
                <dt className="text-[#6f6a61]">Price</dt>
                <dd className="mt-0.5 text-[#11100e]">{priceLabel}</dd>
              </div>
            ) : null}
            {artwork.description ? (
              <div className="sm:col-span-2 md:col-span-1">
                <dt className="text-[#6f6a61]">About</dt>
                <dd className="mt-0.5 max-w-xs text-[#11100e]">{artwork.description}</dd>
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
