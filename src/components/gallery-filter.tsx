"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { SiteData, Artwork } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

const all = "All";
const PAGE_SIZE = 25;

type FormatCategory = "Landscape" | "Square" | "Portrait";
type SizeCategory = "Small" | "Medium" | "Large";

function getFormat(artwork: { widthCm: number; heightCm: number }): FormatCategory {
  const { widthCm, heightCm } = artwork;
  const max = Math.max(widthCm, heightCm);
  if (max === 0) return "Portrait";
  const ratio = Math.abs(widthCm - heightCm) / max;
  if (ratio <= 0.05) return "Square";
  return widthCm > heightCm ? "Landscape" : "Portrait";
}

function getSizeCategory(artwork: { widthCm: number; heightCm: number }): SizeCategory {
  const max = Math.max(artwork.widthCm, artwork.heightCm);
  if (max < 50) return "Small";
  if (max <= 100) return "Medium";
  return "Large";
}

function formatPrice(artwork: Artwork): string | null {
  if (artwork.priceAzn != null) return `AZN ${artwork.priceAzn.toLocaleString()}`;
  return null;
}

function priceRangeLabel(value: string): string {
  switch (value) {
    case "under-1000":
      return "Under AZN 1,000";
    case "1000-3000":
      return "AZN 1,000 – 3,000";
    case "3000-5000":
      return "AZN 3,000 – 5,000";
    case "over-5000":
      return "Over AZN 5,000";
    default:
      return all;
  }
}

function matchesPriceRange(artwork: Artwork, range: string): boolean {
  const price = artwork.priceAzn;
  if (price == null) return false;
  switch (range) {
    case "under-1000":
      return price < 1000;
    case "1000-3000":
      return price >= 1000 && price <= 3000;
    case "3000-5000":
      return price >= 3000 && price <= 5000;
    case "over-5000":
      return price > 5000;
    default:
      return true;
  }
}

const formatOptions: string[] = [all, "Landscape", "Square", "Portrait"];
const sizeOptions: string[] = [all, "Small", "Medium", "Large"];
const priceOptions: string[] = [all, "under-1000", "1000-3000", "3000-5000", "over-5000"];

export function GalleryFilter({ data }: { data: SiteData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const artist = searchParams.get("artist") ?? all;
  const format = searchParams.get("format") ?? all;
  const size = searchParams.get("size") ?? all;
  const priceRange = searchParams.get("price") ?? all;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const artistOptions = [all, ...data.artists.map((item) => item.slug)];
  const artistLabel = (slug: string) => data.artists.find((item) => item.slug === slug)?.name ?? slug;

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === all || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset to first page when filters change
    if (key !== "page") {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const filtered = useMemo(
    () =>
      data.artworks.filter((item) => {
        return (
          (artist === all || item.artistSlug === artist) &&
          (format === all || getFormat(item) === format) &&
          (size === all || getSizeCategory(item) === size) &&
          (priceRange === all || matchesPriceRange(item, priceRange))
        );
      }),
    [artist, format, size, priceRange, data.artworks],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <div className="grid gap-4 border-b border-black/10 pb-8 sm:grid-cols-2 lg:grid-cols-4">
        <Filter label="Artist" value={artist} options={artistOptions} getLabel={artistLabel} onChange={(v) => setParam("artist", v)} />
        <Filter label="Format" value={format} options={formatOptions} onChange={(v) => setParam("format", v)} />
        <Filter label="Size" value={size} options={sizeOptions} onChange={(v) => setParam("size", v)} />
        <Filter label="Price" value={priceRange} options={priceOptions} getLabel={priceRangeLabel} onChange={(v) => setParam("price", v)} />
      </div>

      <p className="mt-6 text-xs uppercase tracking-[0.12em] text-[#6f6a61]">
        {filtered.length} {filtered.length === 1 ? "artwork" : "artworks"}
        {safePage > 1 ? ` · page ${safePage} of ${totalPages}` : ""}
      </p>

      <div className="mt-6 grid auto-rows-[180px] gap-4 sm:auto-rows-[220px] lg:auto-rows-[260px] sm:grid-cols-2 lg:grid-cols-4">
        {pageItems.map((artwork) => {
          const fmt = getFormat(artwork);
          const isLandscape = fmt === "Landscape";
          const isPortrait = fmt === "Portrait";
          return (
            <Link
              href={`/gallery/${artwork.slug}`}
              key={artwork.slug}
              className={`group relative block overflow-hidden bg-[#e2ded4] ${
                isLandscape ? "sm:col-span-2" : ""
              } ${isPortrait ? "row-span-2" : ""}`}
            >
              <RoomImage
                src={artwork.image}
                alt={artwork.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                fallbackText={artwork.title}
                sizes={isLandscape ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 100vw, 25vw"}
              />
              <span className="overlay-text">View artwork</span>
              <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-4 transition-transform duration-500 group-hover:translate-y-0">
                <p className="section-kicker text-white/70">{fmt}</p>
                <p className="room-serif mt-1 text-lg leading-tight text-[#f4f1ea]">{artwork.title}</p>
                <p className="mt-1 text-xs text-white/70">{artistLabel(artwork.artistSlug)}</p>
                {formatPrice(artwork) ? (
                  <p className="mt-1 text-xs font-semibold text-[#f4f1ea]">{formatPrice(artwork)}</p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Gallery pagination">
          <button
            type="button"
            onClick={() => setParam("page", String(safePage - 1))}
            disabled={safePage <= 1}
            className="flex h-10 w-10 items-center justify-center border border-black/12 text-[#11100e] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setParam("page", String(p))}
              className={`flex h-10 w-10 items-center justify-center border text-xs font-semibold transition ${
                p === safePage
                  ? "border-[#11100e] bg-[#11100e] text-[#f4f1ea]"
                  : "border-black/12 text-[#11100e] hover:bg-black/5"
              }`}
              aria-label={`Page ${p}`}
              aria-current={p === safePage ? "page" : undefined}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setParam("page", String(safePage + 1))}
            disabled={safePage >= totalPages}
            className="flex h-10 w-10 items-center justify-center border border-black/12 text-[#11100e] transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </nav>
      )}
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
      <select
        className="mt-2 block w-full border border-black/12 bg-transparent px-3 py-3 text-sm normal-case tracking-normal text-[#11100e]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {getLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}
