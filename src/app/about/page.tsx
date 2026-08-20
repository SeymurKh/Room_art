import { PageHero } from "@/components/page-hero";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getSiteData } from "@/lib/site-data";

export default async function AboutPage() {
  const data = await getSiteData();
  return (
    <main>
      <SiteNav dark />
      <PageHero kicker="About Room" title="Concept, vision, identity" copy="A contemporary art and wine bar space in the heart of Baku." />
      <section className="room-shell max-w-2xl space-y-10 py-12 md:py-16">
        <Block title="Concept" copy={data.about.concept} />
        <Block title="Vision" copy={data.about.vision} />
        <Block title="Identity" copy={data.about.identity} />
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}

function Block({ title, copy }: { title: string; copy: string }) {
  return (
    <article className="border-b border-black/10 pb-8">
      <h2 className="room-serif text-xl md:text-2xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-[#6f6a61]">{copy}</p>
    </article>
  );
}