import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { getSiteData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const data = await getSiteData();
  const upcoming = data.exhibitions.filter((item) => item.status === "Upcoming");
  const past = data.exhibitions.filter((item) => item.status === "Past");
  return (
    <main>
      <PageHero settings={data.settings} kicker="Exhibitions & events" title="Upcoming and archive" copy="Current exhibitions, artist talks, and past ROOM projects." />
      <EventGroup title="Upcoming" events={upcoming} />
      <EventGroup title="Past archive" events={past} />
      <SiteFooter settings={data.settings} />
    </main>
  );
}

function EventGroup({ title, events }: { title: string; events: Awaited<ReturnType<typeof getSiteData>>["exhibitions"] }) {
  return (
    <section className="room-shell border-b border-black/10 py-16">
      <p className="section-kicker">{title}</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {events.map((event) => (
          <article key={event.slug} className="bg-[#ebe7df] p-3">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src={event.image} alt={event.title} fill className="object-cover" />
            </div>
            <p className="section-kicker mt-5">{event.type}</p>
            <h2 className="room-serif mt-2 text-4xl leading-none">{event.title}</h2>
            <p className="mt-2 text-sm text-[#6f6a61]">{event.date}</p>
            <p className="mt-5 text-sm leading-7 text-[#6f6a61]">{event.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
