import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageHero } from "@/components/page-hero";
import { GalleryFilter } from "@/components/gallery-filter";
import { getSiteData } from "@/lib/site-data";

// Инлайн-SVG с feTurbulence — зерно в тон грайнистого hero-шейдера главной.
const NOISE_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

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
      {/* Затемнение фона, чтобы не отвлекало от картин */}
      <div className="fixed inset-0 -z-10 bg-black/55" />
      {/* Зерно поверх фона — перекликается с шумом hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: `url("${NOISE_SVG}")` }}
      />

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