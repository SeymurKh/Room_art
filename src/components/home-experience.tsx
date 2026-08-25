"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { SiteData } from "@/lib/types";
import { useTypewriter } from "@/lib/use-typewriter";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { RoomImage } from "@/components/room-image";
import { SectionHeading } from "@/components/section-heading";
import { HeroSlideshowShader } from "@/components/hero-slideshow-shader";
import { ParallaxWindow } from "@/components/parallax-window";
import { GalleryScrolltelling } from "@/components/gallery-scrolltelling";
import { MobileArtworkCarousel } from "@/components/mobile-artwork-carousel";
import { ArtistsCarousel } from "@/components/artists-carousel";
import { EventsScrolltelling } from "@/components/events-scrolltelling";
import { MobileEventsCarousel } from "@/components/mobile-events-carousel";
import { whatsappContactUrl } from "@/lib/whatsapp";

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: "easeOut" },
} as const;

export function HomeExperience({ data }: { data: SiteData }) {
  const { word, cursor } = useTypewriter();
  const current = data.events.find((item) => item.status === "Current" && item.featured) ?? data.events.find((item) => item.status === "Current") ?? null;
  const upcoming = data.events.find((item) => item.status === "Upcoming" && item.featured) ?? data.events.find((item) => item.status === "Upcoming") ?? null;
  const pastFallback = current
    ? null
    : data.events
        .filter((item) => item.status === "Past")
        .sort((a, b) => Number(b.featured) - Number(a.featured) || data.events.indexOf(a) - data.events.indexOf(b))[0] ?? null;
  const displayedArtworks = data.artworks.filter((a) => a.displayed);
  const [galleryScale, setGalleryScale] = useState(1);

  const showcase = [
    {
      kicker: current ? "Current event" : pastFallback ? "Past event" : "Events",
      title: current?.title ?? pastFallback?.title ?? "All events",
      meta: current?.date ?? pastFallback?.date ?? "",
      href: current ? `/events/${current.slug}` : pastFallback ? `/events/${pastFallback.slug}` : "/events",
    },
    ...(upcoming
      ? [
          {
            kicker: "Upcoming event" as const,
            title: upcoming.title,
            meta: upcoming.date,
            href: `/events/${upcoming.slug}`,
          },
        ]
      : []),
    {
      kicker: "New artworks",
      title: "Discover",
      meta: "The latest additions",
      href: "/gallery",
    },
  ];

  // Фон — 4 фото заведения из public/assets/hero.
  const slideshowImages = useMemo(() => [
    "/assets/hero/hero-1.png",
    "/assets/hero/hero-2.png",
    "/assets/hero/hero-3.png",
    "/assets/hero/hero-4.png",
  ], []);

  return (
    <main className="bg-[#f4f1ea]">
      <SiteNav dark />

      {/* ===== HERO ===== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0c0c0b] text-[#f4f1ea]">
        <HeroSlideshowShader images={slideshowImages} />
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        <div className="room-shell relative z-10 px-4 text-center">
          {/* Desktop — one line */}
          <h1 className="room-serif hidden overflow-visible text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.9] md:block">
            <span>{word}</span>
            <span
              className={`ml-1 inline-block w-[0.05em] align-middle font-light ${
                cursor ? "opacity-100" : "opacity-0"
              } transition-opacity duration-75`}
              style={{ backgroundColor: "currentColor", height: "0.75em" }}
            >
              &nbsp;
            </span>
          </h1>
          {/* Mobile — same single line */}
          <h1 className="room-serif overflow-visible text-[clamp(2.75rem,11vw,4.5rem)] font-medium leading-[1.1] md:hidden">
            <span>{word}</span>
            <span
              className={`ml-1 inline-block w-[0.05em] align-middle font-light ${
                cursor ? "opacity-100" : "opacity-0"
              } transition-opacity duration-75`}
              style={{ backgroundColor: "currentColor", height: "0.75em" }}
            >
              &nbsp;
            </span>
          </h1>
        </div>

        {current ? (
          <Link
            href={`/events/${current.slug}`}
            className="absolute bottom-6 left-6 z-20 flex max-w-[90vw] items-center gap-5 border border-white/15 bg-black/50 p-4 backdrop-blur-md transition hover:bg-black/70 md:bottom-8 md:left-8 md:p-5"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[#0c0c0b] md:h-28 md:w-28">
              {current.image ? (
                <RoomImage
                  src={current.image}
                  alt={current.title}
                  fill
                  className="object-contain"
                  fallbackText={current.title}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="section-kicker flex items-center gap-2 text-white/60"><span className="live-dot" /> Now showing</p>
              <p className="room-serif mt-1 truncate text-xl leading-tight text-[#f4f1ea] md:text-2xl">
                {current.title}
              </p>
              {current.date ? (
                <p className="mt-1 truncate text-sm text-white/60">{current.date}</p>
              ) : null}
            </div>
          </Link>
        ) : null}
      </section>

      <ParallaxWindow src="/assets/window-bg.jpg" alt="Room interior" className="hidden md:block">
        <div className={`room-shell grid divide-y divide-white/10 md:divide-x md:divide-y-0 ${showcase.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
          {showcase.map(({ kicker, title, meta, href }) => (
            <Link href={href} key={kicker} className="group block py-8 md:px-8">
              <p className="section-kicker text-white/85">{kicker}</p>
              <p className="room-serif mt-3 text-2xl leading-none text-[#f4f1ea] md:mt-4 md:text-3xl">{title}</p>
              <p className="mt-2 text-sm text-white/80">{meta}</p>
            </Link>
          ))}
        </div>
      </ParallaxWindow>

      {displayedArtworks.length > 0 ? (
        <>
          <div className="hidden md:block">
            <GalleryScrolltelling artworks={displayedArtworks} scale={galleryScale} onScaleChange={setGalleryScale} />
          </div>
          <MobileArtworkCarousel artworks={displayedArtworks} scale={galleryScale} onScaleChange={setGalleryScale} />
        </>
      ) : null}

      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#0c0c0b] py-12 md:min-h-0 md:py-32" id="artists">
        <div className="room-shell relative z-10">
          <motion.div {...reveal}>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-3xl">
                <h2 className="room-serif text-4xl font-medium leading-[0.96] text-[#f4f1ea] sm:text-5xl md:text-7xl">Artists</h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-white/62">Individual practices with biographies, statements, and portfolios.</p>
              </div>
              <Link
                href="/artists"
                className="inline-flex shrink-0 items-center gap-2 border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f4f1ea] transition hover:bg-white/10"
              >
                All artists <ArrowUpRight size={14} />
              </Link>
            </div>
          </motion.div>
          <div className="mt-10 md:mt-12">
            <ArtistsCarousel artists={data.artists} dark />
          </div>
        </div>
      </section>

      <div className="hidden md:block">
        <EventsScrolltelling events={data.events} />
      </div>
      <MobileEventsCarousel events={data.events} />

      <section className="flex min-h-[50vh] items-center bg-[#ebe7df] py-12 md:py-32">
        <div className="room-shell grid gap-10 md:grid-cols-[.85fr_1.15fr]">
          <motion.div {...reveal}>
            <SectionHeading kicker="About Room" title="A Baku space for precise encounters" copy={data.about.concept} />
            <p className="mt-8 text-sm leading-7 text-[#6f6a61]">{data.about.vision}</p>
          </motion.div>
        </div>
      </section>

      <section className="room-shell flex min-h-[50vh] items-center py-12 md:py-32">
        <motion.div {...reveal} className="grid gap-8 md:grid-cols-[.8fr_1.2fr]">
          <SectionHeading kicker="Contact / collaboration" title="Let's connect" copy="For collaborations, events, artist proposals, and private viewings." />
          <div className="border border-black/10 bg-white/35 p-5 md:p-10">
            <p className="text-sm leading-7 text-[#6f6a61]">{data.settings.address}</p>
            <p className="mt-3 text-sm md:mt-4">{data.settings.email}</p>
            <p className="text-sm">{data.settings.phone}</p>
            <a href={whatsappContactUrl(data.settings)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[#11100e] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea] md:mt-8 md:w-auto">
              Write on WhatsApp <ArrowUpRight size={16} />
            </a>
          </div>
        </motion.div>
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}