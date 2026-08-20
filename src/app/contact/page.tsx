import { PageHero } from "@/components/page-hero";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/contact-form";
import { getSiteData } from "@/lib/site-data";

export default async function ContactPage() {
  const data = await getSiteData();
  return (
    <main>
      <SiteNav dark />
      <PageHero kicker="Contact / collaboration" title="Let's connect" copy="For collaborations, events, artist proposals, partnerships, and private viewings." />
      <section className="room-shell grid gap-10 py-12 md:grid-cols-[.8fr_1.2fr] md:gap-12 md:py-16">
        <aside className="text-sm leading-8 text-[#6f6a61]">
          <h2 className="room-serif text-2xl text-[#11100e]">Visit us</h2>
          <div className="mt-4">
            <p>{data.settings.address}</p>
            <p>{data.settings.phone}</p>
            <p>{data.settings.email}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#11100e]">
            <a href={data.settings.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={data.settings.facebook} target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </aside>
        <ContactForm settings={data.settings} />
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}