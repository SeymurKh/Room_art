import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { GalleryFilter } from "@/components/gallery-filter";
import { getSiteData } from "@/lib/site-data";

export default async function GalleryPage() {
  const data = await getSiteData();
  return (
    <main>
      <PageHero settings={data.settings} kicker="Artworks" title="Gallery" copy="A catalogue of ROOM artworks with filters by artist, medium, category, and availability." />
      <section className="room-shell py-12 md:py-16">
        <GalleryFilter data={data} />
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}