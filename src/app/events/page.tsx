import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { getSiteData } from "@/lib/site-data";

export default async function EventsPage() {
  const data = await getSiteData();
  const current = data.exhibitions.filter((item) => item.status === "Current");
  const upcoming = data.exhibitions.filter((item) => item.status === "Upcoming");
  const past = data.exhibitions.filter((item) => item.status === "Past");
  return (
    <main>
      <PageHero settings={data.settings} kicker="Exhibitions & events" title="Upcoming and archive" copy="Current exhibitions, artist talks, and past ROOM projects." />
      <EventGroup title="Current" events={current} />
      <EventGroup title="Upcoming" events={upcoming} />
      <EventGroup title="Past archive" events={past} />
      <SiteFooter settings={data.settings} />
    </main>
  );
}

function EventGroup({ title, events }: { title: string; events: Awaited<ReturnType<typeof getSiteData>>["exhibitions"] }) {
  return (
    <section className="room-shell border-b border-black/10 py-16">
      <p className="section-kicker text-[#6f6a61]">{title}</p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {events.map((event) => (
          <Link href={`/events/${event.slug}`} key={event.slug} className="group">
            <article className="bg-[#ebe7df] p-3">
              <div className="card-img-overlay relative aspect-4/3 overflow-hidden">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="pointer-events-none select-none" style={{ width: "auto", height: "auto", maxWidth: "none", transform: event.thumbTransform }} draggable={false} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[#e2ded4] text-xs uppercase tracking-[0.14em] text-[#6f6a61]">No image</div>
                )}
                <span className="overlay-text">View event</span>
              </div>
              <p className="section-kicker mt-5 text-[#6f6a61]">{event.type}</p>
              <div className="mt-2 flex items-start justify-between gap-3"><h2 className="room-serif text-4xl leading-none">{event.title}</h2><ArrowUpRight size={18} className="mt-1 shrink-0 opacity-30 transition group-hover:opacity-100" /></div>
              <p className="mt-2 text-sm text-[#6f6a61]">{event.date}</p>
              <p className="mt-5 text-sm leading-7 text-[#6f6a61]">{event.description}</p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}