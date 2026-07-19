import { SiteNav } from "@/components/site-nav";
import type { SiteSettings } from "@/lib/types";

export function PageHero({
  settings,
  kicker,
  title,
  copy,
}: {
  settings: SiteSettings;
  kicker: string;
  title: string;
  copy?: string;
}) {
  return (
    <section className="border-b border-black/10 bg-[#f4f1ea] pt-16">
      <SiteNav />
      <div className="room-shell py-3 md:py-6">
        <p className="section-kicker">{kicker}</p>
        <h1 className="room-serif mt-4 max-w-4xl text-4xl font-medium leading-[0.95] md:text-6xl">
          {title}
        </h1>
        {copy ? <p className="mt-6 max-w-xl text-sm leading-7 text-[#6f6a61]">{copy}</p> : null}
      </div>
    </section>
  );
}
