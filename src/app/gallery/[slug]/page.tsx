import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ArtworkViewer } from "@/components/artwork-viewer";
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
  const artistNames = Object.fromEntries(data.artists.map((artist) => [artist.slug, artist.name]));
  return (
    <main>
      <SiteNav dark />
      {/* Suspense — требование Next для компонентов с useSearchParams (см. ArtworkViewer). */}
      <Suspense fallback={null}>
        <ArtworkViewer
          artworks={data.artworks}
          artistNames={artistNames}
          initialSlug={artwork.slug}
          settings={data.settings}
        />
      </Suspense>
      <SiteFooter settings={data.settings} />
    </main>
  );
}