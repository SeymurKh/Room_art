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
      <section className="room-shell grid gap-10 pt-24 md:grid-cols-[1fr_1.05fr] md:gap-16 md:pt-28">
        <div className="order-2 md:order-1">
          <p className="section-kicker text-[#6f6a61]">{artist.role}</p>
          <h1 className="room-serif mt-3 text-5xl font-medium leading-[0.88] md:mt-5 md:text-7xl lg:text-8xl">
            {artist.name}
          </h1>
          <div className="mt-6 grid max-w-2xl gap-8 text-sm leading-7 text-[#6f6a61] md:mt-10 md:grid-cols-2">
            <p className="md:col-span-2">{artist.bio}</p>
          </div>
          <blockquote className="room-serif mt-8 max-w-xl border-l border-black/20 pl-5 text-xl leading-snug md:mt-10 md:pl-6 md:text-2xl">
            {artist.statement}
          </blockquote>
        </div>
        <div className="relative order-1 aspect-[3/4] w-full max-h-[70vh] overflow-hidden bg-black md:order-2 md:aspect-auto md:max-h-[75vh]">
          <RoomImage
            src={artist.portrait}
            alt={artist.name}
            fill
            priority
            className="object-cover grayscale"
            fallbackText={artist.name}
          />
        </div>
      </section>

      <section className="room-shell py-16 md:py-24">
        <p className="section-kicker text-[#6f6a61]">Artworks</p>
        <div className="mt-6 columns-1 gap-5 sm:columns-2 lg:columns-3 md:mt-8">
          {artworks.map((artwork) => (
            <Link href={`/gallery/${artwork.slug}`} key={artwork.slug} className="group mb-5 block break-inside-avoid">
              <div
                className="card-img-overlay relative overflow-hidden bg-[#e2ded4]"
                style={{ aspectRatio: `${artwork.widthCm} / ${artwork.heightCm}` }}
              >
                <RoomImage
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  fallbackText={artwork.title}
                />
                <span className="overlay-text">View artwork</span>
              </div>
              <div className="mt-4 flex justify-between gap-4">
                <div>
                  <h2 className="room-serif text-2xl md:text-3xl">{artwork.title}</h2>
                  <p className="mt-1 text-sm text-[#6f6a61]">
                    {artwork.medium}, {artwork.year} · {artwork.dimensions}
                  </p>
                </div>
                <ArrowUpRight size={18} className="mt-0.5 shrink-0 opacity-30 transition group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}
