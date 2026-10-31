import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { RoomImage } from "@/components/room-image";
import { getSiteData } from "@/lib/site-data";
import { getDictionary } from "@/lib/i18n";
import { isLocale, localeHref, pickLocalized, type Locale } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return pageMetadata(locale, "/artists", { title: getDictionary(locale).artists.title });
}

export default async function ArtistsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const t = getDictionary(locale);
  const data = await getSiteData();
  return (
    <main className="relative">
      <div className="fixed inset-0 -z-10 bg-[#0c0c0b]" />

      <SiteNav dark lang={locale} />
      <PageHero
        kicker={t.artists.kicker}
        title={t.artists.title}
        copy={t.artists.copy}
      />
      <section className="room-shell grid grid-cols-2 gap-3 py-8 lg:grid-cols-4 md:gap-4 md:py-16">
        {data.artists.map((artist) => (
          <Link href={localeHref(locale, `/artists/${artist.slug}`)} key={artist.slug} className="group">
            <div className="card-img-overlay relative aspect-[3/4] overflow-hidden rounded-xl bg-black md:rounded-3xl">
              <RoomImage
                src={artist.portrait}
                alt={artist.name}
                fill
                className="object-cover transition duration-700 group-hover:scale-105 grayscale"
                fallbackText={artist.name}
              />
              <span className="overlay-text">{t.artists.viewArtist}</span>
            </div>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#f4f1ea]">
                  {artist.name}
                </h2>
                <p className="mt-1 text-sm text-white/60">{pickLocalized(artist.role, locale)}</p>
              </div>
              <ArrowUpRight
                size={18}
                className="mt-0.5 shrink-0 text-white/70 opacity-30 transition group-hover:opacity-100"
              />
            </div>
          </Link>
        ))}
      </section>
      <SiteFooter settings={data.settings} lang={locale} />
    </main>
  );
}