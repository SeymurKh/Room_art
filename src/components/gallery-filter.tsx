"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { SiteData, Artwork } from "@/lib/types";
import { RoomImage } from "@/components/room-image";

const all = "All";
const PAGE_SIZE = 24;

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
      <div className="grid gap-4 border-b border-white/10 pb-8 sm:grid-cols-2 lg:grid-cols-4">
        <Filter label="Artist" value={artist} options={artistOptions} getLabel={artistLabel} onChange={(v) => setParam("artist", v)} />
        <Filter label="Format" value={format} options={formatOptions} onChange={(v) => setParam("format", v)} />
        <Filter label="Size" value={size} options={sizeOptions} onChange={(v) => setParam("size", v)} />
        <Filter label="Price" value={priceRange} options={priceOptions} getLabel={priceRangeLabel} onChange={(v) => setParam("price", v)} />
      </div>

      <p className="mt-8 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/50">
        {filtered.length} {filtered.length === 1 ? "artwork" : "artworks"}
        {safePage > 1 ? ` · page ${safePage} of ${totalPages}` : ""}
      </p>

      {pageItems.length === 0 ? (
        <p className="mt-16 text-center text-sm text-white/40">
          No artworks match the selected filters.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((artwork) => (
            <Link href={`/gallery/${artwork.slug}`} key={artwork.slug} className="group block">
              <div
                className="card-img-overlay relative w-full bg-[#e2ded4]"
                style={{ aspectRatio: `${artwork.widthCm} / ${artwork.heightCm}` }}
              >
                <RoomImage
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  fallbackText={artwork.title}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <span className="overlay-text">View artwork</span>
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="room-serif truncate text-xl leading-tight text-[#f4f1ea]">
                    {artwork.title}
                  </p>
                  <p className="mt-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/55">
                    {artistLabel(artwork.artistSlug)} · {artwork.year}
                  </p>
                  <p className="mt-1 text-xs text-white/40">{artwork.dimensions}</p>
                </div>
                <div className="shrink-0 text-right">
                  {formatPrice(artwork) ? (
                    <p className="text-xs font-semibold tracking-[0.06em] text-[#f4f1ea]">
                      {formatPrice(artwork)}
                    </p>
                  ) : null}
                  <ArrowUpRight
                    size={16}
                    className="ml-auto mt-2 text-white/25 transition group-hover:text-[#f4f1ea]"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Gallery pagination">
          <button
            type="button"
            onClick={() => setParam("page", String(safePage - 1))}
            disabled={safePage <= 1}
            className="flex h-10 w-10 items-center justify-center border border-white/20 text-[#f4f1ea] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
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
                  ? "border-[#f4f1ea] bg-[#f4f1ea] text-[#11100e]"
                  : "border-white/20 text-[#f4f1ea] hover:bg-white/10"
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
            className="flex h-10 w-10 items-center justify-center border border-white/20 text-[#f4f1ea] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
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
    <label className="block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/50">
      {label}
      <span className="relative mt-2.5 block">
        <select
          className="w-full appearance-none border border-white/20 bg-black/30 px-4 py-3.5 pr-10 text-sm normal-case tracking-normal text-[#f4f1ea] outline-none backdrop-blur-sm transition hover:border-white/40 focus:border-[#f4f1ea]/70"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-[#11100e] text-[#f4f1ea]">
              {getLabel(option)}
            </option>
          ))}
        </select>
        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50"
        />
      </span>
    </label>
  );
}