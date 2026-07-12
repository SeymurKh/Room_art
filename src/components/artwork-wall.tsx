"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Artwork, SiteSettings } from "@/lib/types";
import { whatsappArtworkUrl } from "@/lib/whatsapp";
import { RoomImage } from "@/components/room-image";

function scaleFactor(widthCm: number, heightCm: number): number {
  // Max dimension of this artwork vs a reference ~max artwork size (140cm)
  const maxDim = Math.max(widthCm, heightCm);
  const refMax = 140;
  // scale from 0.55 (smallest) to 1.0 (largest)
  return 0.55 + (maxDim / refMax) * 0.45;
}

export function ArtworkWall({
  artwork,
  artist,
  settings,
}: {
  artwork: Artwork;
  artist: string;
  settings: SiteSettings;
}) {
  const aspect = artwork.widthCm / artwork.heightCm;
  const isPortrait = aspect < 1;
  const scale = scaleFactor(artwork.widthCm, artwork.heightCm);

  // Container width based on scale: smaller artwork = smaller frame
  const baseWidth = isPortrait ? `${40 * scale}vw` : `${65 * scale}vw`;
  const maxWidth = isPortrait ? `${420 * scale}px` : `${700 * scale}px`;
  const borderWidth = `${Math.round(10 + scale * 10)}px`; // 10–20px border

  return (
    <section className="wall min-h-screen pt-16">
      <div className="room-shell grid min-h-[calc(100vh-4rem)] items-center gap-10 py-16 md:grid-cols-[1.15fr_.85fr]">
        <div className="relative flex min-h-[560px] items-center justify-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 120, rotateX: 40, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="gallery-shadow relative border-[#11100e] bg-black"
            style={{
              width: `min(${baseWidth}, ${maxWidth})`,
              aspectRatio: `${artwork.widthCm} / ${artwork.heightCm}`,
              borderWidth,
              transformPerspective: 1200,
            }}
          >
            <RoomImage
              src={artwork.image}
              alt={artwork.title}
              fill
              priority
              className="object-cover"
              fallbackText="Artwork image unavailable"
            />
          </motion.div>
          <div className="absolute bottom-10 left-1/2 h-9 w-[62%] -translate-x-1/2 rounded-full bg-black/22 blur-2xl" />
        </div>
        <motion.aside
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.35 }}
          className="border border-black/12 bg-[#f4f1ea]/72 p-6 backdrop-blur md:p-10"
        >
          <p className="section-kicker">{artist}</p>
          <h1 className="room-serif mt-4 text-6xl font-medium leading-[0.9]">{artwork.title}</h1>
          <p className="mt-6 text-sm leading-7 text-[#6f6a61]">{artwork.description}</p>
          <dl className="mt-8 grid gap-4 border-y border-black/10 py-6 text-sm">
            <Row label="Year" value={artwork.year} />
            <Row label="Medium" value={artwork.medium} />
            <Row label="Category" value={artwork.category} />
            <Row label="Dimensions" value={artwork.dimensions} />
            <Row label="Availability" value={artwork.availability} />
          </dl>
          <a
            href={whatsappArtworkUrl(settings, artwork)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 bg-[#11100e] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea]"
          >
            Inquire on WhatsApp <ArrowUpRight size={16} />
          </a>
        </motion.aside>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-4">
      <dt className="text-[#6f6a61]">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}