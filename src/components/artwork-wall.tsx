"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Artwork, SiteSettings } from "@/lib/types";
import { whatsappArtworkUrl } from "@/lib/whatsapp";
import { ArtworkFrame } from "@/components/artwork-frame";

export function ArtworkWall({
  artwork,
  artist,
  settings,
}: {
  artwork: Artwork;
  artist: string;
  settings: SiteSettings;
}) {
  return (
    <section className="wall min-h-fit pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="room-shell grid items-start gap-10 py-8 md:grid-cols-[1.25fr_0.75fr] md:items-center md:py-16">
        <div className="relative flex min-h-[65vh] items-center justify-center md:min-h-[75vh]">
          <motion.div
            initial={{ opacity: 0, y: 120, rotateX: 40, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            style={{ transformPerspective: 1200 }}
          >
            <ArtworkFrame artwork={artwork} priority />
          </motion.div>
          <div className="absolute bottom-10 left-1/2 h-9 w-[62%] -translate-x-1/2 rounded-full bg-black/22 blur-2xl" />
        </div>
        <motion.aside
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.35 }}
          className="border border-black/12 bg-[#f4f1ea]/72 p-6 backdrop-blur md:p-10"
        >
          <p className="section-kicker text-[#6f6a61]">{artist}</p>
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