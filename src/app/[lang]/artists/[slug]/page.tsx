import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ArtistPhotoBlock } from "@/components/artist-photo-block";
import { ArtworkSalon } from "@/components/artwork-salon";
import { getSiteData } from "@/lib/site-data";
import { getDictionary } from "@/lib/i18n";
import { isLocale, localeHref, pickLocalized, type Locale } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  const t = getDictionary(locale);
  const data = await getSiteData();
  const artist = data.artists.find((item) => item.slug === slug);
  if (!artist) return { title: t.pages.artistNotFound };
  return {
    title: artist.name,
    description: pickLocalized(artist.bio, locale),
    alternates: {
      canonical: localeHref(locale, `/artists/${artist.slug}`),
      languages: {
        en: `/artists/${artist.slug}`,
        az: `/az/artists/${artist.slug}`,
      },
    },
  };
}

export default async function ArtistPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const t = getDictionary(locale);
  const data = await getSiteData();
  const artist = data.artists.find((item) => item.slug === slug);
  if (!artist) notFound();
  const artworks = data.artworks.filter((item) => item.artistSlug === artist.slug);

  return (
    <main className="relative">
      <div className="fixed inset-0 -z-10 bg-[#0c0c0b]" />

      <SiteNav dark lang={locale} />

      {/* Hero — 100vh: bio + statement + photos */}
      <section className="room-shell flex min-h-0 items-start pt-20 pb-6 md:min-h-screen md:items-center md:pt-24 md:pb-16">
        <div className="grid w-full gap-4 md:grid-cols-[1fr_1.1fr] md:gap-16">
          {/* Left: text */}
          <div className="flex flex-col justify-center order-2 md:order-1">
            <p className="section-kicker text-white/50">{pickLocalized(artist.role, locale)}</p>
            <h1 className="room-serif mt-1 text-5xl font-medium leading-[0.88] text-[#f4f1ea] md:mt-5 md:text-7xl lg:text-8xl">
              {artist.name}
            </h1>
            <div className="mt-1 max-w-lg text-sm leading-7 text-white/62 md:mt-8">
              <p>{pickLocalized(artist.bio, locale)}</p>
            </div>
            {pickLocalized(artist.statement, locale) ? (
              <blockquote className="room-serif mt-2 max-w-lg border-l border-white/20 pl-5 text-lg leading-snug text-[#f4f1ea]/80 md:mt-8 md:pl-6 md:text-xl">
                {pickLocalized(artist.statement, locale)}
              </blockquote>
            ) : null}
          </div>

          {/* Right: creative photo block */}
          <div className="order-1 md:order-2 flex items-center justify-center">
            <ArtistPhotoBlock portrait={artist.portrait} name={artist.name} photos={artist.photos} />
          </div>
        </div>
      </section>

      {/* Artworks section */}
      <section className="room-shell py-16 md:py-24">
        <p className="section-kicker text-white/50">{t.artists.artworks}</p>
        <div className="mt-8 md:mt-10">
          <ArtworkSalon artworks={artworks} dark navContext={{ kind: "artist", artistSlug: artist.slug }} />
        </div>
      </section>
      <SiteFooter settings={data.settings} lang={locale} />
    </main>
  );
}