import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PositionedImage } from "@/components/positioned-image";
import { getSiteData } from "@/lib/site-data";

export async function generateStaticParams() {
  const data = await getSiteData();
  return data.events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSiteData();
  const event = data.events.find((item) => item.slug === slug);
  if (!event) return { title: "Event not found" };
  return { title: event.title, description: event.description };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSiteData();
  const event = data.events.find((item) => item.slug === slug);
  if (!event) notFound();

  return (
    <main>
      <SiteNav />
      <section className="room-shell grid gap-10 pt-24 md:grid-cols-2 md:gap-16 md:pt-28">
        <div className="order-2 flex flex-col justify-center md:order-1">
          <div className="flex items-center gap-3">
            <span className="border border-black/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.12em]">
              {event.status}
            </span>
          </div>
          <h1 className="room-serif mt-4 text-4xl font-medium leading-[0.92] md:mt-5 md:text-6xl lg:text-7xl">
            {event.title}
          </h1>
          <p className="mt-5 text-sm tracking-[0.08em] text-[#6f6a61] md:mt-6">{event.date}</p>
          <div className="mt-6 max-w-lg text-sm leading-7 text-[#6f6a61] md:mt-8">
            <p>{event.description}</p>
          </div>
          <Link
            href="/events"
            className="mt-8 inline-flex w-fit items-center gap-2 border-b border-black/20 pb-1 text-xs font-semibold uppercase tracking-[0.14em] transition hover:border-black/60 md:mt-10"
          >
            <ArrowUpRight size={16} /> All events
          </Link>
        </div>
        <div className="relative order-1 aspect-[4/5] w-full overflow-hidden bg-black md:order-2 md:aspect-auto md:max-h-[75vh]">
          <PositionedImage
            src={event.image}
            alt={event.title}
            transform={event.detailTransform}
            containerClassName="h-full w-full"
          />
        </div>
      </section>

      {event.video ? (
        <section className="room-shell border-b border-black/10 py-12 md:py-16">
          <p className="section-kicker text-[#6f6a61]">Video portrait</p>
          <div className="mt-6 overflow-hidden bg-black md:mt-8">
            <div className="relative aspect-video w-full">
              <video
                src={event.video}
                controls
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </div>
        </section>
      ) : null}

      {event.gallery && event.gallery.length > 0 ? (
        <section className="room-shell border-b border-black/10 py-12 md:py-16">
          <p className="section-kicker text-[#6f6a61]">Photo report</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:mt-8 lg:grid-cols-4">
            {event.gallery.map((src) => (
              <div key={src} className="relative aspect-square overflow-hidden bg-[#e2ded4]">
                <Image
                  src={src}
                  alt={`${event.title} — photo`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <SiteFooter settings={data.settings} />
    </main>
  );
}
