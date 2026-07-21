import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { RoomImage } from "@/components/room-image";
import { getSiteData } from "@/lib/site-data";

export async function generateStaticParams() {
  const data = await getSiteData();
  return data.artists.map((artist) => ({ slug: artist.slug }));
}

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
    <main>
      <SiteNav />
      <section className="room-shell grid min-h-screen gap-12 pt-28 md:grid-cols-[.85fr_1.15fr]">
        <div>
          <p className="section-kicker text-[#6f6a61]">{artist.role}</p>
          <h1 className="room-serif mt-5 text-7xl font-medium leading-[0.88] md:text-9xl">{artist.name}</h1>
          <p className="mt-8 max-w-lg text-sm leading-7 text-[#6f6a61]">{artist.bio}</p>
          <blockquote className="room-serif mt-10 max-w-lg border-l border-black/20 pl-6 text-3xl leading-tight">
            {artist.statement}
          </blockquote>
        </div>
        <div className="relative min-h-160 overflow-hidden bg-black">
          <RoomImage src={artist.portrait} alt={artist.name} fill priority className="object-cover grayscale" fallbackText={artist.name} />
        </div>
      </section>
      <section className="room-shell py-20">
        <p className="section-kicker text-[#6f6a61]">Artworks</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {artworks.map((artwork) => (
            <Link href={`/gallery/${artwork.slug}`} key={artwork.slug} className="group">
              <div className="card-img-overlay relative aspect-4/5 overflow-hidden">
                <RoomImage src={artwork.image} alt={artwork.title} fill className="object-cover transition duration-700 group-hover:scale-105" fallbackText={artwork.title} />
                <span className="overlay-text">View artwork</span>
              </div>
              <div className="mt-4 flex justify-between gap-4">
                <h2 className="room-serif text-3xl">{artwork.title}</h2>
                <ArrowUpRight size={18} className="opacity-30 transition group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}