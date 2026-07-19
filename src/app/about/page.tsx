import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { RoomImage } from "@/components/room-image";
import { getSiteData } from "@/lib/site-data";

export default async function AboutPage() {
  const data = await getSiteData();
  return (
    <main>
      <PageHero settings={data.settings} kicker="About Room" title="Concept, vision, identity" copy="A contemporary art and wine bar space in the heart of Baku." />
      <section className="room-shell grid gap-12 py-16 md:grid-cols-[.9fr_1.1fr]">
        <div className="space-y-10">
          <Block title="Concept" copy={data.about.concept} />
          <Block title="Vision" copy={data.about.vision} />
          <Block title="Identity" copy={data.about.identity} />
        </div>
        <div className="relative min-h-[700px] overflow-hidden">
          <RoomImage src={data.about.image} alt="ROOM interior" fill priority className="object-cover" fallbackText="ROOM interior" />
        </div>
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}

function Block({ title, copy }: { title: string; copy: string }) {
  return (
    <article className="border-b border-black/10 pb-8">
      <h2 className="room-serif text-2xl">{title}</h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[#6f6a61]">{copy}</p>
    </article>
  );
}
