import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getSiteData } from "@/lib/site-data";

export async function generateStaticParams() {
  const data = await getSiteData();
  return data.exhibitions.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSiteData();
  const event = data.exhibitions.find((item) => item.slug === slug);
  if (!event) return { title: "Event not found" };
  return { title: event.title, description: event.description };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getSiteData();
  const event = data.exhibitions.find((item) => item.slug === slug);
  if (!event) notFound();

  return (
    <main>
      <SiteNav />
      <section className="room-shell grid min-h-screen gap-12 pt-28 md:grid-cols-[.85fr_1.15fr]">
        <div>
          <div className="flex items-center gap-3"><p className="section-kicker text-[#6f6a61]">{event.type}</p><span className="border border-black/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-[0.12em]">{event.status}</span></div>
          <h1 className="room-serif mt-5 text-7xl font-medium leading-[0.88] md:text-9xl">{event.title}</h1>
          <p className="mt-6 text-sm tracking-[0.08em] text-[#6f6a61]">{event.date}</p>
          <p className="mt-8 max-w-lg text-sm leading-7 text-[#6f6a61]">{event.description}</p>
          <Link href="/events" className="mt-10 inline-flex items-center gap-2 border-b border-black/20 pb-1 text-xs font-semibold uppercase tracking-[0.14em] transition hover:border-black/60"><ArrowUpRight size={16} /> All events</Link>
        </div>
        <div className="relative min-h-160 overflow-hidden bg-black">
          {event.image ? (
            <img src={event.image} alt={event.title} className="pointer-events-none select-none" style={{ width: "auto", height: "auto", maxWidth: "none", transform: event.detailTransform }} draggable={false} />
          ) : (
            <div className="flex h-full items-center justify-center"><p className="text-sm text-white/30">No image</p></div>
          )}
        </div>
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}