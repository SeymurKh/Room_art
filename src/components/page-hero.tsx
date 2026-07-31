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
      <div className="room-shell py-4 md:py-6">
        <p className="section-kicker text-[#6f6a61]">{kicker}</p>
        <h1 className="room-serif mt-3 max-w-4xl text-3xl font-medium leading-[0.95] md:mt-4 md:text-6xl">
          {title}
        </h1>
        {copy ? <p className="mt-4 max-w-xl text-sm leading-7 text-[#6f6a61] md:mt-6">{copy}</p> : null}
      </div>
    </section>
  );
}
