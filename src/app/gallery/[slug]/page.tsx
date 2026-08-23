import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ArtworkWall } from "@/components/artwork-wall";
import { getSiteData } from "@/lib/site-data";

export async function generateStaticParams() {
  const data = await getSiteData();
  return data.artworks.map((artwork) => ({ slug: artwork.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSiteData();
  const artwork = data.artworks.find((item) => item.slug === slug);
  if (!artwork) return { title: "Artwork not found" };
  return {
    title: artwork.title,
    description: `${artwork.title} — ${artwork.dimensions}, ${artwork.medium}`,
  };
}

export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSiteData();
  const artwork = data.artworks.find((item) => item.slug === slug);
  if (!artwork) notFound();
  const artist = data.artists.find((item) => item.slug === artwork.artistSlug)?.name ?? "ROOM artist";
  return (
    <main>
      <SiteNav dark />
      <ArtworkWall artwork={artwork} artist={artist} settings={data.settings} />
      <SiteFooter settings={data.settings} />
    </main>
  );
}