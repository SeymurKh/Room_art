import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { RoomImage } from "@/components/room-image";
import { getSiteData } from "@/lib/site-data";

export default async function ArtistsPage() {
  const data = await getSiteData();
  return (
    <main className="relative">
      {/* Fixed photo backdrop + light overlay */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/artists-bg.png')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/40" />

      <SiteNav dark />
      <PageHero
        kicker="Room artist base"
        title="Artists"
        copy="Artists we work with, individual profiles, statements, and portfolios."
      />
      <section className="room-shell grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4 md:py-16">
        {data.artists.map((artist) => (
          <Link href={`/artists/${artist.slug}`} key={artist.slug} className="group">
            <div className="card-img-overlay relative aspect-[3/4] overflow-hidden bg-black">
              <RoomImage
                src={artist.portrait}
                alt={artist.name}
                fill
                className="object-cover grayscale transition duration-700 group-hover:scale-105 group-hover:grayscale-0"
                fallbackText={artist.name}
              />
              <span className="overlay-text">View artist</span>
            </div>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#f4f1ea]">
                  {artist.name}
                </h2>
                <p className="mt-1 text-sm text-white/60">{artist.role}</p>
              </div>
              <ArrowUpRight
                size={18}
                className="mt-0.5 shrink-0 text-white/70 opacity-30 transition group-hover:opacity-100"
              />
            </div>
          </Link>
        ))}
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}