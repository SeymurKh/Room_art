import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { GalleryFilter } from "@/components/gallery-filter";
import { getSiteData } from "@/lib/site-data";

export default async function GalleryPage() {
  const data = await getSiteData();
  const count = data.artworks.length;
  return (
    <main className="relative">
      {/* Fixed photo backdrop + single uniform overlay — no seams between sections */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/gallery-bg.png')" }}
      />
      <div className="fixed inset-0 -z-10 bg-black/45" />

      <SiteNav dark />
      <PageHero
        kicker="Artworks"
        title="Gallery"
        copy={`${count} ${count === 1 ? "artwork" : "artworks"} in the collection`}
      />

      <section className="room-shell py-12 md:py-16">
        <GalleryFilter data={data} />
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}