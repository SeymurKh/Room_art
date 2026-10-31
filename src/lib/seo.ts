import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";
import { type Locale } from "@/lib/i18n/config";

const BASE = "https://roomgallery.art";

function azPathOf(path: string): string {
  return path === "/" ? "/az" : `/az${path}`;
}

/**
 * Метаданные страницы с hreflang-альтернативами EN (без префикса) / AZ (`/az/...`).
 * Вызывается из `generateMetadata` каждой публичной страницы.
 */
export function pageMetadata(
  locale: Locale,
  path: string,
  opts: { title: string; description?: string }
): Metadata {
  const t = getDictionary(locale);
  const description = opts.description ?? t.meta.description;
  return {
    title: opts.title,
    description,
    alternates: {
      canonical: locale === "az" ? azPathOf(path) : path,
      languages: {
        en: `${BASE}${path}`,
        az: `${BASE}${azPathOf(path)}`,
      },
    },
    openGraph: {
      title: opts.title,
      description,
      url: locale === "az" ? azPathOf(path) : path,
    },
    twitter: {
      title: opts.title,
      description,
    },
  };
}