import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteNav } from "@/components/site-nav";
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
      <SiteNav dark />
      <PageHero kicker="Events" title="Events at ROOM" />

      {/* Current — only shown when exists */}
      {current.length > 0 ? (
        <section className="room-shell py-12 md:py-16">
          <p className="section-kicker text-[#a58e63]">Now showing</p>
          <div className="mt-6 grid gap-5 md:mt-8 md:grid-cols-2">
            {current.map((event) => (
              <EventCard key={event.slug} event={event} featured />
            ))}
          </div>
        </section>
      ) : null}

      {/* Upcoming */}
      {upcoming.length > 0 ? (
        <section className="room-shell border-t border-black/10 py-12 md:py-16">
          <p className="section-kicker text-[#6f6a61]">Upcoming</p>
          <div className="mt-6 grid gap-5 md:mt-8 md:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Past */}
      {past.length > 0 ? (
        <section className="room-shell border-t border-black/10 py-12 md:py-16">
          <p className="section-kicker text-[#6f6a61]">Past archive</p>
          <div className="mt-6 grid gap-5 md:mt-8 md:grid-cols-3">
            {past.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        </section>
      ) : null}

      <SiteFooter settings={data.settings} />
    </main>
  );
}

function EventCard({ event, featured = false }: { event: Event; featured?: boolean }) {
  return (
    <Link href={`/events/${event.slug}`} className="group">
      <article className="bg-[#ebe7df] p-3">
        <div className="card-img-overlay relative overflow-hidden rounded-xl bg-[#e2ded4]" style={{ aspectRatio: "3/2" }}>
          <PositionedImage
            src={event.image}
            alt={event.title}
            transform={event.thumbTransform}
            mode="contain"
            containerClassName="h-full w-full"
          />
          <span className="overlay-text">View event</span>
        </div>
        <div className="mt-5 flex items-start justify-between gap-3">
          <h2 className={`room-serif leading-none ${featured ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl"}`}>
            {event.title}
          </h2>
          <ArrowUpRight size={18} className="mt-1 shrink-0 opacity-30 transition group-hover:opacity-100" />
        </div>
        <p className="mt-2 text-sm text-[#6f6a61]">{event.date}</p>
        <p className="mt-5 text-sm leading-7 text-[#6f6a61] line-clamp-3">{event.description}</p>
      </article>
    </Link>
  );
}