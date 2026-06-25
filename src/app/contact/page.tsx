import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { ContactForm } from "@/components/contact-form";
import { getSiteData } from "@/lib/site-data";

export default async function ContactPage() {
  const data = await getSiteData();
  return (
    <main>
      <PageHero settings={data.settings} kicker="Contact / collaboration" title="Let's connect" copy="For collaborations, exhibitions, artist proposals, partnerships, and private viewings." />
      <section className="room-shell grid gap-12 py-16 md:grid-cols-[.8fr_1.2fr]">
        <aside className="text-sm leading-8 text-[#6f6a61]">
          <p>{data.settings.address}</p>
          <p>{data.settings.phone}</p>
          <p>{data.settings.email}</p>
          <div className="mt-8 flex gap-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#11100e]">
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