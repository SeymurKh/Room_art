import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { PositionedImage } from "@/components/positioned-image";
import { getSiteData } from "@/lib/site-data";
import type { Event } from "@/lib/types";

export default async function EventsPage() {
  const data = await getSiteData();
  const current = data.events.filter((item) => item.status === "Current");
  const upcoming = data.events.filter((item) => item.status === "Upcoming");
  const past = data.events.filter((item) => item.status === "Past");
  return (
    <main>
      <PageHero settings={data.settings} kicker="Events" title="Events at ROOM" />
      <EventGroup title="Current" events={current} />
      <EventGroup title="Upcoming" events={upcoming} />
      <EventGroup title="Past archive" events={past} />
      <SiteFooter settings={data.settings} />
    </main>
  );
}

function EventGroup({ title, events }: { title: string; events: Event[] }) {
  return (
    <section className="room-shell border-b border-black/10 py-12 md:py-16">
      <p className="section-kicker text-[#6f6a61]">{title}</p>
      <div className="mt-6 grid gap-5 md:mt-8 md:grid-cols-3">
        {events.map((event) => (
          <Link href={`/events/${event.slug}`} key={event.slug} className="group">
            <article className="bg-[#ebe7df] p-3">
              <div className="card-img-overlay relative aspect-[4/3] overflow-hidden bg-[#e2ded4]">
                <PositionedImage
                  src={event.image}
                  alt={event.title}
                  transform={event.thumbTransform}
                  containerClassName="h-full w-full"
                />
                <span className="overlay-text">View event</span>
              </div>
              <div className="mt-5 flex items-start justify-between gap-3">
                <h2 className="room-serif text-3xl leading-none md:text-4xl">{event.title}</h2>
                <ArrowUpRight size={18} className="mt-1 shrink-0 opacity-30 transition group-hover:opacity-100" />
              </div>
              <p className="mt-2 text-sm text-[#6f6a61]">{event.date}</p>
              <p className="mt-5 text-sm leading-7 text-[#6f6a61]">{event.description}</p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}