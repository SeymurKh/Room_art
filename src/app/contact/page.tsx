import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { getSiteData } from "@/lib/site-data";
import { whatsappContactUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const data = await getSiteData();
  return (
    <main>
      <PageHero settings={data.settings} kicker="Contact / collaboration" title="Let's connect" copy="For collaborations, exhibitions, artist proposals, partnerships, and private viewings." />
      <section className="room-shell grid gap-12 py-16 md:grid-cols-[.8fr_1.2fr]">
        <aside className="text-sm leading-8 text-[#6f6a61]">
          <p>{data.settings.address}</p>
          <p>{data.settings.phone}</p>
          <p>{data.settings.email}</p>
          <div className="mt-8 flex gap-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#11100e]">
            <a href={data.settings.instagram}>Instagram</a>
            <a href={data.settings.facebook}>Facebook</a>
          </div>
        </aside>
        <form action={whatsappContactUrl(data.settings, "a collaboration")} className="grid gap-4 border border-black/10 bg-white/35 p-6 md:p-10">
          <input className="admin-input" name="name" placeholder="Name" />
          <input className="admin-input" name="email" type="email" placeholder="Email" />
          <input className="admin-input" name="subject" placeholder="Subject" />
          <textarea className="admin-input min-h-40 resize-none" name="message" placeholder="Message" />
          <a href={whatsappContactUrl(data.settings, "a collaboration")} target="_blank" className="inline-flex w-fit items-center gap-2 bg-[#11100e] px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f4f1ea]">
            Send on WhatsApp <ArrowUpRight size={16} />
          </a>
        </form>
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}
