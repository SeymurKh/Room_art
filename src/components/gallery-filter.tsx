"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { SiteData } from "@/lib/types";
import { ArtworkSalon } from "@/components/artwork-salon";
import { ALL, filterArtworks } from "@/lib/artwork-filter";
import { getDictionary } from "@/lib/i18n";
import { useLang } from "@/lib/use-lang";

const PAGE_SIZE = 10;

const formatOptions: string[] = [ALL, "Landscape", "Square", "Portrait"];
const sizeOptions: string[] = [ALL, "Small", "Medium", "Large"];
const priceOptions: string[] = [ALL, "under-1000", "1000-3000", "3000-5000", "over-5000"];

/**
 * Возвращает страницы для пагинации с «окном» вокруг текущей и многоточиями,
 * чтобы на мобильном не выводились все кнопки подряд.
 * Формат: число страницы или null (многоточие).
 */
function getPaginationItems(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | null)[] = [1];

  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);

  if (left > 2) items.push(null);
  for (let p = left; p <= right; p++) items.push(p);
  if (right < total - 1) items.push(null);

  items.push(total);
  return items;
}

export function GalleryFilter({ data }: { data: SiteData }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = useLang();
  const t = getDictionary(lang);

  const artist = searchParams.get("artist") ?? ALL;
  const format = searchParams.get("format") ?? ALL;
  const size = searchParams.get("size") ?? ALL;
  const priceRange = searchParams.get("price") ?? ALL;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const artistOptions = [ALL, ...data.artists.map((item) => item.slug)];
  const artistLabel = (slug: string) => data.artists.find((item) => item.slug === slug)?.name ?? slug;

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reset to first page when filters change
    if (key !== "page") {
      params.delete("page");
    }
    // Page changes jump to the top; filter changes keep scroll position
    router.push(`${pathname}?${params.toString()}`, { scroll: key === "page" });
  }

  // Единая логика отбора (artwork-filter) — та же, что и в контекстной навигации
  // детальной страницы, поэтому порядок обхода совпадает со списком галереи.
  const filtered = useMemo(
    () => filterArtworks(data.artworks, { artist, format, size, price: priceRange }),
    [artist, format, size, priceRange, data.artworks],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 border-b border-white/10 pb-6 lg:grid-cols-4">
        <Filter label={t.gallery.filterArtist} value={artist} options={artistOptions} getLabel={artistLabel} onChange={(v) => setParam("artist", v)} />
        <Filter label={t.gallery.filterFormat} value={format} options={formatOptions} getLabel={(v) => (v === "All" ? t.gallery.all : v === "Landscape" ? t.gallery.landscape : v === "Square" ? t.gallery.square : t.gallery.portrait)} onChange={(v) => setParam("format", v)} />
        <Filter label={t.gallery.filterSize} value={size} options={sizeOptions} getLabel={(v) => (v === "All" ? t.gallery.all : v === "Small" ? t.gallery.small : v === "Medium" ? t.gallery.medium : t.gallery.large)} onChange={(v) => setParam("size", v)} />
        <Filter label={t.gallery.filterPrice} value={priceRange} options={priceOptions} getLabel={(v) => (v === "All" ? t.gallery.all : v === "under-1000" ? t.gallery.priceUnder : v === "1000-3000" ? t.gallery.priceMid1 : v === "3000-5000" ? t.gallery.priceMid2 : t.gallery.priceOver)} onChange={(v) => setParam("price", v)} />
      </div>

      <p className="mt-8 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/50">
        {t.gallery.count(filtered.length)}
        {safePage > 1 ? ` · ${t.gallery.pageOf(safePage, totalPages)}` : ""}
      </p>

      {pageItems.length === 0 ? (
        <p className="mt-16 text-center text-sm text-white/40">
          {t.gallery.empty}
        </p>
      ) : (
        <div className="mt-10">
          <ArtworkSalon
            artworks={pageItems}
            dark
            artistLabel={artistLabel}
            showPrice
            navContext={{ kind: "gallery", filters: { artist, format, size, price: priceRange } }}
          />
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-14 flex items-center justify-center gap-2" aria-label={t.gallery.pagination}>
          <button
            type="button"
            onClick={() => setParam("page", String(safePage - 1))}
            disabled={safePage <= 1}
            className="flex h-10 w-10 items-center justify-center border border-white/20 text-[#f4f1ea] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={t.gallery.prevPage}
          >
            <ChevronLeft size={18} />
          </button>
          {getPaginationItems(safePage, totalPages).map((p, i) =>
            p === null ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs text-white/40">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setParam("page", String(p))}
                className={`flex h-10 w-10 items-center justify-center border text-xs font-semibold transition ${
                  p === safePage
                    ? "border-[#f4f1ea] bg-[#f4f1ea] text-[#11100e]"
                    : "border-white/20 text-[#f4f1ea] hover:bg-white/10"
                }`}
                aria-label={t.gallery.goToPage(p)}
                aria-current={p === safePage ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => setParam("page", String(safePage + 1))}
            disabled={safePage >= totalPages}
            className="flex h-10 w-10 items-center justify-center border border-white/20 text-[#f4f1ea] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label={t.gallery.nextPage}
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
  getLabel?: (item: string) => string;
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