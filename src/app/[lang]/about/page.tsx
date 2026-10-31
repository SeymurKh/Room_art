import { notFound } from "next/navigation";
import { PageHero } from "@/components/page-hero";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getSiteData } from "@/lib/site-data";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return pageMetadata(locale, "/about", { title: getDictionary(locale).about.title });
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const t = getDictionary(locale);
  const data = await getSiteData();
  return (
    <main className="flex min-h-screen flex-col">
      <SiteNav dark lang={locale} />
      <PageHero title={t.about.title} />
      <section className="room-shell flex-1 grid gap-10 py-12 md:grid-cols-3 md:gap-12 md:py-16">
        <Block title={t.about.visionTitle}>
          <p>{t.about.visionP1}</p>
          <p>{t.about.visionP2}</p>
        </Block>
        <Block title={t.about.missionTitle}>
          <p>{t.about.missionP1}</p>
          <p>{t.about.missionP2}</p>
        </Block>
        <Block title={t.about.moreTitle}>
          <p>{t.about.moreP1}</p>
          <p>{t.about.moreP2}</p>
          <p>{t.about.moreP3}</p>
          <p>{t.about.moreP4}</p>
        </Block>
      </section>
      <SiteFooter settings={data.settings} lang={locale} />
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article>
      <h2 className="room-serif text-xl md:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-[#6f6a61]">
        {children}
      </div>
    </article>
  );
}