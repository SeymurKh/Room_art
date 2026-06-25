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
      <SiteNav settings={settings} />
      <div className="room-shell py-20 md:py-28">
        <p className="section-kicker">{kicker}</p>
        <h1 className="room-serif mt-5 max-w-4xl text-6xl font-medium leading-[0.9] md:text-8xl">
          {title}
        </h1>
        {copy ? <p className="mt-7 max-w-xl text-sm leading-7 text-[#6f6a61]">{copy}</p> : null}
      </div>
    </section>
  );
}
