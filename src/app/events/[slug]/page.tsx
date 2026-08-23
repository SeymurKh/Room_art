import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PositionedImage } from "@/components/positioned-image";
import { MediaLightbox, type MediaItem } from "@/components/media-lightbox";
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

  // Build media items array for lightbox
  const mediaItems: MediaItem[] = [];
  if (event.image) mediaItems.push({ src: event.image, alt: event.title, type: "image" });
  if (event.video) mediaItems.push({ src: event.video, alt: `${event.title} — video`, type: "video" });
  if (event.gallery) {
    for (const src of event.gallery) {
      mediaItems.push({ src, alt: event.title, type: "image" });
    }
  }

  const hasMedia = mediaItems.length > 0;

  return (
    <main className="relative">
      {/* Dark background */}
      <div className="fixed inset-0 -z-10 bg-[#0c0c0b]" />

      <SiteNav dark />

      {/* Hero — text left, main photo right */}
      <section className="room-shell grid min-h-[70vh] items-center gap-8 pt-28 pb-12 md:grid-cols-[1fr_1.1fr] md:gap-16 md:pt-32 md:pb-16">
        {/* Left: text */}
        <div className="flex flex-col justify-center">
          <p className="section-kicker text-white/50">{event.status}</p>
          <h1 className="room-serif mt-3 text-4xl font-medium leading-[0.92] text-[#f4f1ea] md:text-6xl lg:text-7xl">
            {event.title}
          </h1>
          <p className="mt-4 text-sm tracking-[0.08em] text-white/60">{event.date}</p>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/85" style={{ fontWeight: 100, WebkitFontSmoothing: "antialiased" }}>{event.description}</p>
          <Link
            href="/events"
            className="mt-8 inline-flex w-fit items-center gap-2 border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea] transition hover:bg-white/10"
          >
            <ArrowUpRight size={14} /> All events
          </Link>
        </div>

        {/* Right: main event photo — fills container */}
        {event.image ? (
          <div className="relative w-full max-h-[60vh] max-w-[420px] aspect-[5/9] overflow-hidden rounded-2xl bg-black shadow-2xl mx-auto">
            <MediaLightbox items={mediaItems} index={0}>
              <PositionedImage
                src={event.image}
                alt={event.title}
                transform={event.heroTransform}
                containerClassName="h-full w-full"
              />
            </MediaLightbox>
          </div>
        ) : null}
      </section>

      {/* Media grid — masonry columns, all items in one flow */}
      {hasMedia ? (
        <section className="room-shell pb-16 md:pb-24">
          <div className="columns-2 gap-3 space-y-3 md:columns-3 lg:columns-4">
            {/* Video — 9:16 */}
            {event.video ? (
              <MediaLightbox items={mediaItems} index={1}>
                <div className="relative break-inside-avoid overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "9/16" }}>
                  <video
                    src={event.video}
                    playsInline
                    preload="metadata"
                    muted
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="grid size-12 place-items-center rounded-full border border-white/30 bg-black/50 text-white">
                      ▶
                    </div>
                  </div>
                </div>
              </MediaLightbox>
            ) : null}

            {/* Gallery photos — natural aspect ratios */}
            {event.gallery
              ? event.gallery.map((src, i) => {
                  const itemIndex = 1 + (event.video ? 1 : 0) + i;
                  return (
                    <MediaLightbox key={src} items={mediaItems} index={itemIndex}>
                      <div className="relative break-inside-avoid overflow-hidden rounded-xl bg-black">
                        <Image
                          src={src}
                          alt={`${event.title} — ${i + 1}`}
                          width={600}
                          height={400}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="h-auto w-full object-cover"
                        />
                      </div>
                    </MediaLightbox>
                  );
                })
              : null}
          </div>
        </section>
      ) : null}

      <SiteFooter settings={data.settings} />
    </main>
  );
}