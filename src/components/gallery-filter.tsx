"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { SiteData } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

const all = "All";

type FormatCategory = "Landscape" | "Square" | "Portrait";

function getFormat(artwork: { widthCm: number; heightCm: number }): FormatCategory {
  const { widthCm, heightCm } = artwork;
  const max = Math.max(widthCm, heightCm);
  if (max === 0) return "Portrait";
  const ratio = Math.abs(widthCm - heightCm) / max;
  if (ratio <= 0.05) return "Square";
  return widthCm > heightCm ? "Landscape" : "Portrait";
}

const formatOptions: string[] = [all, "Landscape", "Square", "Portrait"];

export function GalleryFilter({ data }: { data: SiteData }) {
  const [artist, setArtist] = useState(all);
  const [format, setFormat] = useState(all);
  const artistOptions = [all, ...data.artists.map((item) => item.slug)];
  const artistLabel = (slug: string) => data.artists.find((item) => item.slug === slug)?.name ?? slug;

  const filtered = useMemo(
    () =>
      data.artworks.filter((item) => {
        return (
          (artist === all || item.artistSlug === artist) &&
          (format === all || getFormat(item) === format)
        );
      }),
    [artist, format, data.artworks],
  );

  return (
    <>
      <div className="grid gap-3 border-b border-black/10 pb-8 md:grid-cols-2">
        <Filter label="Artist" value={artist} options={artistOptions} getLabel={artistLabel} onChange={setArtist} />
        <Filter label="Format" value={format} options={formatOptions} onChange={setFormat} />
      </div>
      <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((artwork) => (
          <Link href={`/gallery/${artwork.slug}`} key={artwork.slug} className="group block">
            <div className="card-img-overlay relative aspect-4/5 overflow-hidden bg-[#e2ded4]">
              <RoomImage src={artwork.image} alt={artwork.title} fill className="object-cover transition duration-700 group-hover:scale-105" fallbackText={artwork.title} />
              <span className="overlay-text">View artwork</span>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker text-[#6f6a61]">{getFormat(artwork)}</p>
                <h2 className="room-serif mt-2 text-3xl leading-none">{artwork.title}</h2>
                <p className="mt-2 text-sm text-[#6f6a61]">{artistLabel(artwork.artistSlug)}</p>
              </div>
              <ArrowUpRight size={18} className="opacity-30 transition group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

function Filter({
  label,
  value,
  options,
  onChange,
  getLabel = (item) => item,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  getLabel?: (value: string) => string;
}) {
  return (
    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f6a61]">
      {label}
      <select className="mt-2 block w-full border border-black/12 bg-transparent px-3 py-3 text-sm normal-case tracking-normal text-[#11100e]" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}