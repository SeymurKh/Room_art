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
import { ArtistsCarousel } from "@/components/artists-carousel";
import { EventsScrolltelling } from "@/components/events-scrolltelling";
import { whatsappContactUrl } from "@/lib/whatsapp";

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: "easeOut" },
} as const;

export function HomeExperience({ data }: { data: SiteData }) {
  const { displayed, cursor } = useTypewriter();
  const current = data.exhibitions.find((item) => item.status === "Current" && item.featured) ?? data.exhibitions.find((item) => item.status === "Current") ?? null;
  const featuredArtworks = data.artworks.slice(0, 5);

  const slideshowImages = useMemo(() => {
    return data.artworks.slice(0, 5).map((a) => a.image);
  }, [data.artworks]);

  return (
    <main className="bg-[#f4f1ea]">
      <SiteNav dark />

      {/* ===== HERO ===== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0c0c0b] text-[#f4f1ea]">
        <HeroSlideshowShader images={slideshowImages} />
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
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
        </div>
      </section>

      <ParallaxWindow src="/assets/window-bg.jpg" alt="Room interior">
        <div className="room-shell grid divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
          {[
            ["Current exhibition", current?.title, current?.date],
            ["Upcoming event", data.exhibitions.find((event) => event.type === "Event")?.title, "8 Jun"],
            ["New artworks", "Discover", "The latest additions"],
          ].map(([kicker, title, meta]) => (
            <Link href={kicker === "New artworks" ? "/gallery" : "/events"} key={kicker} className="group py-8 md:px-8">
              <p className="section-kicker text-white/85">{kicker}</p>
              <p className="room-serif mt-4 text-3xl leading-none text-[#f4f1ea]">{title}</p>
              <p className="mt-2 text-sm text-white/80">{meta}</p>
            </Link>
          ))}
        </div>
      </ParallaxWindow>

      <GalleryScrolltelling artworks={featuredArtworks} />

      <section className="room-shell py-24 md:py-32" id="artists">
        <motion.div {...reveal}>
          <SectionHeading kicker="Room artist base" title="Our artists" copy="Individual practices with biographies, statements, and connected portfolios." />
        </motion.div>
        <div className="mt-12">
          <ArtistsCarousel artists={data.artists} />
        </div>
      </section>

      <EventsScrolltelling exhibitions={data.exhibitions} />

      <section className="border-y border-black/10 bg-[#ebe7df] py-24 md:py-32">
        <div className="room-shell grid gap-12 md:grid-cols-[.85fr_1.15fr]">
          <motion.div {...reveal}>
            <SectionHeading kicker="About Room" title="A Baku space for precise encounters" copy={data.about.concept} />
            <p className="mt-8 text-sm leading-7 text-[#6f6a61]">{data.about.vision}</p>
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