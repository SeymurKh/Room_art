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
    <section className="wall min-h-fit pt-20 pb-12 md:pt-32 md:pb-24">
      <div className="room-shell grid items-start gap-8 py-6 md:grid-cols-[1fr_1fr] md:items-center md:gap-10 md:py-16">
        <div className="relative flex min-h-[50vh] items-center justify-center md:min-h-[75vh]">
          <motion.div
            initial={{ opacity: 0, y: 120, rotateX: 40, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            style={{ transformPerspective: 1200 }}
          >
            <ArtworkFrame artwork={artwork} priority enableLens />
          </motion.div>
          <div className="absolute bottom-10 left-1/2 h-9 w-[62%] -translate-x-1/2 rounded-full bg-black/22 blur-2xl" />
        </div>
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.35 }}
          className="min-w-0 border border-black/12 bg-[#f4f1ea]/72 p-5 backdrop-blur md:min-w-[400px] md:p-10"
        >
          <p className="section-kicker text-[#6f6a61]">{artist}</p>
          <h1 className="room-serif mt-3 text-4xl font-medium leading-[0.9] md:mt-4 md:text-6xl">{artwork.title}</h1>
          {artwork.description ? (
            <p className="mt-6 text-sm leading-7 text-[#6f6a61]">{artwork.description}</p>
          ) : null}
          <dl className="mt-8 grid gap-4 border-y border-black/10 py-6 text-sm">
            <Row label="Year" value={artwork.year} />
            <Row label="Medium" value={artwork.medium} />
            <Row label="Dimensions" value={artwork.dimensions} />
            <Row label="Availability" value={artwork.availability} />
            {artwork.price ? <Row label="Price" value={artwork.price} /> : null}
          </dl>
          <a
            href={whatsappArtworkUrl(settings, artwork)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#11100e] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea] md:mt-8 md:w-auto"
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