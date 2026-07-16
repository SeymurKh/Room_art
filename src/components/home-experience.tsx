"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { SiteData } from "@/lib/types";
import { useTypewriter } from "@/lib/use-typewriter";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { RoomImage } from "@/components/room-image";
import { HeroSlideshowShader } from "@/components/hero-slideshow-shader";
import { ParallaxWindow } from "@/components/parallax-window";
import { GalleryScrolltelling } from "@/components/gallery-scrolltelling";
import { whatsappContactUrl } from "@/lib/whatsapp";

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: "easeOut" },
} as const;

export function HomeExperience({ data }: { data: SiteData }) {
  const { displayed, cursor } = useTypewriter();
  const current = data.exhibitions.find((item) => item.slug === data.home.currentExhibitionSlug) ?? data.exhibitions[0];
  const featuredArtworks = data.artworks.slice(0, 5);
  const getArtistName = (slug: string) => data.artists.find((artist) => artist.slug === slug)?.name ?? "ROOM artist";

  const slideshowImages = useMemo(() => {
    const shuffled = [...data.artworks].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5).map((a) => a.image);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="bg-[#f4f1ea]">
      <SiteNav settings={data.settings} dark />

      {/* ===== HERO ===== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0c0c0b] text-[#f4f1ea]">
        {/* Слайдшоу на весь фон */}
        <HeroSlideshowShader images={slideshowImages} />

        {/* Затемнение */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />

        {/* Контент */}
        <div className="room-shell relative z-10 text-center">
          <h1 className="room-serif text-[clamp(2.5rem,6vw,5rem)] font-medium leading-[0.9]">
            <span>{displayed}</span>
            <span
              className={`ml-1 inline-block w-[0.05em] align-middle font-light ${
                cursor ? "opacity-100" : "opacity-0"
              } transition-opacity duration-75`}
              style={{ backgroundColor: "currentColor", height: "0.75em" }}
            >
              &nbsp;
            </span>
          </h1>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/gallery"
              className="inline-flex items-center justify-center gap-2 border border-white/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-black"
            >
              Discover gallery <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/78 transition hover:text-white"
            >
              Current exhibition
            </Link>
          </div>
        </div>
      </section>

      <ParallaxWindow src="/assets/room-window-bg.png" alt="Room interior">
        <div className="room-shell grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            ["Current exhibition", current?.title, current?.date],
            ["Upcoming event", data.exhibitions.find((event) => event.type === "Event")?.title, "8 Jun"],
            ["New artworks", "Discover", "The latest additions"],
          ].map(([kicker, title, meta]) => (
            <Link href={kicker === "New artworks" ? "/gallery" : "/events"} key={kicker} className="group py-8 md:px-8">
              <p className="section-kicker text-white/60">{kicker}</p>
              <p className="room-serif mt-4 text-3xl leading-none text-[#f4f1ea]">{title}</p>
              <p className="mt-2 text-sm text-white/50">{meta}</p>
            </Link>
          ))}
        </div>
      </ParallaxWindow>

      <GalleryScrolltelling artworks={featuredArtworks} />

      <section className="room-shell py-24 md:py-32" id="artists">
        <motion.div {...reveal}>
          <SectionHeading kicker="Room artist base" title="Our artists" copy="Individual practices with biographies, statements, and connected portfolios." />
        </motion.div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.artists.slice(0, 6).map((artist, index) => (
            <motion.div key={artist.slug} {...reveal} transition={{ ...reveal.transition, delay: index * 0.04 }}>
              <Link href={`/artists/${artist.slug}`} className="group block">
                <div className="card-img-overlay relative aspect-[3/4] overflow-hidden bg-black">
                  <RoomImage src={artist.portrait} alt={artist.name} fill className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0" fallbackText={artist.name} />
                  <span className="overlay-text">View artist</span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.12em]">{artist.name}</p>
                    <p className="mt-1 text-sm text-[#6f6a61]">{artist.role}</p>
                  </div>
                  <ArrowUpRight size={18} className="opacity-30 transition group-hover:opacity-100" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="room-shell grid gap-12 py-24 md:grid-cols-[.9fr_1.1fr] md:py-32">
        <motion.div {...reveal}>
          <SectionHeading kicker="Exhibitions & events" title="Activity around the work" copy="Upcoming exhibitions, artist talks, and an archive of past ROOM projects." />
          <Link href="/events" className="mt-9 inline-flex items-center gap-2 border border-black/18 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em]">
            View archive <ArrowUpRight size={16} />
          </Link>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2">
          {data.exhibitions.map((event, index) => (
            <motion.article key={event.slug} {...reveal} transition={{ ...reveal.transition, delay: index * 0.05 }} className="border border-black/10 bg-[#ebe7df] p-3">
              <div className="relative aspect-[4/3] overflow-hidden">
                <RoomImage src={event.image} alt={event.title} fill className="object-cover" fallbackText={event.title} />
              </div>
              <p className="section-kicker mt-5">{event.type}</p>
              <h3 className="room-serif mt-2 text-3xl leading-none">{event.title}</h3>
              <p className="mt-2 text-sm text-[#6f6a61]">{event.date}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#ebe7df] py-24 md:py-32">
        <div className="room-shell grid gap-12 md:grid-cols-[.85fr_1.15fr]">
          <motion.div {...reveal}>
            <SectionHeading kicker="About Room" title="A Baku space for precise encounters" copy={data.about.concept} />
            <p className="mt-8 text-sm leading-7 text-[#6f6a61]">{data.about.vision}</p>
          </motion.div>
          <motion.div {...reveal} className="relative min-h-[520px] overflow-hidden">
            <RoomImage src={data.about.image} alt="ROOM interior" fill className="object-cover" fallbackText="ROOM interior" />
          </motion.div>
        </div>
      </section>

      <section className="room-shell py-24 md:py-32">
        <motion.div {...reveal} className="grid gap-8 md:grid-cols-[.8fr_1.2fr]">
          <SectionHeading kicker="Contact / collaboration" title="Let's connect" copy="For collaborations, exhibitions, artist proposals, and private viewings." />
          <div className="border border-black/10 bg-white/35 p-6 md:p-10">
            <p className="text-sm leading-7 text-[#6f6a61]">{data.settings.address}</p>
            <p className="mt-4 text-sm">{data.settings.email}</p>
            <p className="text-sm">{data.settings.phone}</p>
              <a href={whatsappContactUrl(data.settings)} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 bg-[#11100e] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea]">
              Write on WhatsApp <ArrowUpRight size={16} />
            </a>
          </div>
        </motion.div>
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}