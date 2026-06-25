import { notFound } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ArtworkWall } from "@/components/artwork-wall";
import { getSiteData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSiteData();
  const artwork = data.artworks.find((item) => item.slug === slug);
  if (!artwork) notFound();
  const artist = data.artists.find((item) => item.slug === artwork.artistSlug)?.name ?? "ROOM artist";
  return (
    <main>
      <SiteNav settings={data.settings} />
      <ArtworkWall artwork={artwork} artist={artist} settings={data.settings} />
      <SiteFooter settings={data.settings} />
    </main>
  );
}
