import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { GalleryFilter } from "@/components/gallery-filter";
import { getSiteData } from "@/lib/site-data";

export default async function GalleryPage() {
  const data = await getSiteData();
  return (
    <main className="relative">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/assets/gallery-bg.png')" }}
      />
      <section className="relative bg-black/40">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        <SiteNav dark fixed={false} />
        <div className="room-shell relative z-10 px-4 pb-12 pt-14 text-center md:pb-16 md:pt-20">
          <p className="section-kicker text-white/70">Artworks</p>
          <h1 className="room-serif mt-3 text-3xl font-medium leading-[0.95] text-[#f4f1ea] md:mt-4 md:text-6xl">
            Gallery
          </h1>
          <p className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/50">
            {data.artworks.length} {data.artworks.length === 1 ? "artwork" : "artworks"} in the collection
          </p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </section>
      <section className="room-shell py-12 md:py-16">
        <GalleryFilter data={data} />
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}