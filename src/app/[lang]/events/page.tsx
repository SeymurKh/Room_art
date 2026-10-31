import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PositionedImage } from "@/components/positioned-image";
import { getSiteData } from "@/lib/site-data";
import { getDictionary } from "@/lib/i18n";
import { isLocale,
  localeHref,
  pickLocalized,
  type Locale,
} from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return pageMetadata(locale, "/events", { title: getDictionary(locale).events.title });
}
import type { Event } from "@/lib/types";

export default async function EventsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const t = getDictionary(locale);
  const data = await getSiteData();
  const current = data.events.filter((item) => item.status === "Current");
  const upcoming = data.events.filter((item) => item.status === "Upcoming");
  const past = data.events.filter((item) => item.status === "Past");

  return (
    <main className="relative">
      <div className="fixed inset-0 -z-10 bg-[#0c0c0b]" />
      <SiteNav dark lang={locale} />
      <PageHero kicker={t.events.kicker} title={t.events.title} />

      {/* Current — only shown when exists */}
      {current.length > 0 ? (
        <section className="room-shell py-8 md:py-16">
          <p className="section-kicker text-[#a58e63]">{t.events.nowShowing}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:mt-8 md:gap-5 md:grid-cols-3">
            {current.map((event) => (
              <EventCard key={event.slug} event={event} lang={locale} t={t} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Upcoming */}
      {upcoming.length > 0 ? (
        <section className="room-shell py-8 md:py-16">
          <p className="section-kicker text-white/50">{t.events.upcoming}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:mt-8 md:gap-5 md:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.slug} event={event} lang={locale} t={t} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Past */}
      {past.length > 0 ? (
        <section className="room-shell border-t border-white/10 py-8 md:py-16">
          <p className="section-kicker text-white/50">{t.events.pastArchive}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:mt-8 md:gap-5 md:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.slug} event={event} lang={locale} t={t} />
            ))}
          </div>
        </section>
      ) : null}

      <SiteFooter settings={data.settings} lang={locale} />
    </main>
  );
}

function EventCard({ event, lang, t }: { event: Event; lang: Locale; t: ReturnType<typeof getDictionary> }) {
  return (
    <Link href={localeHref(lang, `/events/${event.slug}`)} className="group">
      <article className="bg-[#11100e] p-3">
        <div className="card-img-overlay relative overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "3/2" }}>
          <PositionedImage
            src={event.image}
            alt={event.title}
            transform={event.thumbTransform}
            mode="contain"
            containerClassName="h-full w-full"
          />
          <span className="overlay-text">{t.events.viewEvent}</span>
        </div>
        <div className="mt-3 flex items-start justify-between gap-2 md:mt-5 md:gap-3">
          <h2 className="room-serif text-lg leading-none text-[#f4f1ea] md:text-2xl">
            {event.title}
          </h2>
          <ArrowUpRight size={18} className="mt-1 shrink-0 text-white/30 transition group-hover:text-white/80" />
        </div>
        <p className="mt-1 text-xs text-white/50 md:mt-2 md:text-xs">{pickLocalized(event.date, lang)}</p>

      </article>
    </Link>
  );
}