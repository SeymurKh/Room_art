import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
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

  const hasGallery = event.gallery && event.gallery.length > 0;
  const hasVideo = !!event.video;

  return (
    <main className="relative">
      {/* Dark background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/artists-bg.png')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/40" />

      <SiteNav dark />

      {/* Header — centered title and description */}
      <section className="room-shell flex flex-col items-center justify-center pt-28 pb-12 text-center md:pt-32 md:pb-16">
        <div className="flex items-center justify-center gap-3">
          <span className="border border-white/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
            {event.status}
          </span>
          {event.featured ? (
            <span className="border border-[#a58e63]/40 bg-[#a58e63]/15 px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#a58e63]">
              Featured
            </span>
          ) : null}
        </div>
        <h1 className="room-serif mt-5 text-4xl font-medium leading-[0.92] text-[#f4f1ea] md:text-6xl lg:text-7xl">
          {event.title}
        </h1>
        <p className="mt-4 text-sm tracking-[0.08em] text-white/60">{event.date}</p>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-white/55">{event.description}</p>
        <Link
          href="/events"
          className="mt-8 inline-flex items-center gap-2 border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea] transition hover:bg-white/10"
        >
          <ArrowUpRight size={14} /> All events
        </Link>
      </section>

      {/* Media grid — main image + gallery + video */}
      {(hasGallery || hasVideo) ? (
        <section className="room-shell pb-16 md:pb-24">
          <div className="flex items-center justify-center gap-3" style={{ minHeight: "50vh" }}>
            {/* Left column — gallery photos */}
            {hasGallery ? (
              <div className="flex flex-col gap-3 flex-1 max-w-[28%]">
                {event.gallery!.slice(0, 3).map((src, i) => {
                  const aspects = ["3/4", "4/3", "1/1"];
                  return (
                    <div key={src} className="relative overflow-hidden rounded-xl bg-black" style={{ aspectRatio: aspects[i] ?? "4/3" }}>
                      <Image src={src} alt={`${event.title} — ${i + 1}`} fill className="object-cover" sizes="20vw" />
                    </div>
                  );
                })}
              </div>
            ) : null}

            {/* Center — main event image */}
            <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl shrink-0" style={{ width: "44%", aspectRatio: "3/4" }}>
              <Image
                src={event.image}
                alt={event.title}
                fill
                priority
                className="object-cover"
                sizes="40vw"
              />
            </div>

            {/* Right column — video + remaining gallery */}
            <div className="flex flex-col gap-3 flex-1 max-w-[28%]">
              {/* Video */}
              {hasVideo ? (
                <div className="relative overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "16/9" }}>
                  <video
                    src={event.video}
                    controls
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ) : null}

              {/* Remaining gallery photos */}
              {hasGallery ? (
                event.gallery!.slice(3, 6).map((src, i) => {
                  const aspects = ["4/3", "1/1", "3/4"];
                  return (
                    <div key={src} className="relative overflow-hidden rounded-xl bg-black" style={{ aspectRatio: aspects[i] ?? "4/3" }}>
                      <Image src={src} alt={`${event.title} — ${i + 4}`} fill className="object-cover" sizes="20vw" />
                    </div>
                  );
                })
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <SiteFooter settings={data.settings} />
    </main>
  );
}