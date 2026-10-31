import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ArtworkViewer } from "@/components/artwork-viewer";
import { getSiteData } from "@/lib/site-data";
import { getDictionary } from "@/lib/i18n";
import {
  formatDimensions,
  isLocale,
  localeHref,
  pickLocalized,
  type Locale,
} from "@/lib/i18n/config";

export async function generateStaticParams() {
  const data = await getSiteData();
  return data.artworks.map((artwork) => ({ slug: artwork.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const t = getDictionary(locale);
  const data = await getSiteData();
  const artwork = data.artworks.find((item) => item.slug === slug);
  if (!artwork) return { title: t.pages.artworkNotFound };
  return {
    title: artwork.title,
    description: `${artwork.title} — ${formatDimensions(artwork, locale)}, ${pickLocalized(artwork.medium, locale)}`,
    alternates: {
      canonical: localeHref(locale, `/gallery/${artwork.slug}`),
      languages: {
        en: `/gallery/${artwork.slug}`,
        az: `/az/gallery/${artwork.slug}`,
      },
    },
  };
}

export default async function ArtworkPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const data = await getSiteData();
  const artwork = data.artworks.find((item) => item.slug === slug);
  if (!artwork) notFound();
  const artistNames = Object.fromEntries(data.artists.map((artist) => [artist.slug, artist.name]));
  return (
    <main>
      <SiteNav dark lang={locale} />
      {/* Suspense — требование Next для компонентов с useSearchParams (см. ArtworkViewer). */}
      <Suspense fallback={null}>
        <ArtworkViewer
          artworks={data.artworks}
          artistNames={artistNames}
          initialSlug={artwork.slug}
          settings={data.settings}
          lang={locale}
        />
      </Suspense>
      <SiteFooter settings={data.settings} lang={locale} />
    </main>
  );
}