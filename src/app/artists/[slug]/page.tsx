import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ArtistPhotoBlock } from "@/components/artist-photo-block";
import { ArtworkSalon } from "@/components/artwork-salon";
import { getSiteData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSiteData();
  const artist = data.artists.find((item) => item.slug === slug);
  if (!artist) return { title: "Artist not found" };
  return {
    title: artist.name,
    description: artist.bio,
  };
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSiteData();
  const artist = data.artists.find((item) => item.slug === slug);
  if (!artist) notFound();
  const artworks = data.artworks.filter((item) => item.artistSlug === artist.slug);

  return (
    <main className="relative">
      {/* Same background as artists listing page */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/artists-bg.png')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/40" />

      <SiteNav dark />

      {/* Hero — 100vh: bio + statement + photos */}
      <section className="room-shell flex min-h-screen items-center pt-20 pb-12 md:pt-24 md:pb-16">
        <div className="grid w-full gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          {/* Left: text */}
          <div className="flex flex-col justify-center order-2 md:order-1">
            <p className="section-kicker text-white/50">{artist.role}</p>
            <h1 className="room-serif mt-3 text-5xl font-medium leading-[0.88] text-[#f4f1ea] md:mt-5 md:text-7xl lg:text-8xl">
              {artist.name}
            </h1>
            <div className="mt-6 max-w-lg text-sm leading-7 text-white/62 md:mt-8">
              <p>{artist.bio}</p>
            </div>
            {artist.statement ? (
              <blockquote className="room-serif mt-6 max-w-lg border-l border-white/20 pl-5 text-lg leading-snug text-[#f4f1ea]/80 md:mt-8 md:pl-6 md:text-xl">
                {artist.statement}
              </blockquote>
            ) : null}
          </div>

          {/* Right: creative photo block */}
          <div className="order-1 md:order-2">
            <ArtistPhotoBlock portrait={artist.portrait} name={artist.name} photos={artist.photos} />
          </div>
        </div>
      </section>

      {/* Artworks section */}
      <section className="room-shell py-16 md:py-24">
        <p className="section-kicker text-white/50">Artworks</p>
        <div className="mt-8 md:mt-10">
          <ArtworkSalon artworks={artworks} dark />
        </div>
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}