import { PageHero } from "@/components/page-hero";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { getSiteData } from "@/lib/site-data";

export default async function AboutPage() {
  const data = await getSiteData();
  return (
    <main className="flex min-h-screen flex-col">
      <SiteNav dark />
      <PageHero title="About Us" />
      <section className="room-shell flex-1 grid gap-10 py-12 md:grid-cols-3 md:gap-12 md:py-16">
        <Block title="Vision">
          <p>To create an open and evolving space where art becomes a natural part of everyday cultural life.</p>
          <p>ROOM envisions a community where artists, audiences, ideas, and different forms of creative expression can come together, creating opportunities for discovery, dialogue, and collaboration.</p>
        </Block>
        <Block title="Mission">
          <p>Our mission is to support artists, make contemporary art more accessible, and create meaningful opportunities for people to discover and engage with art.</p>
          <p>Through exhibitions, events, artist collaborations, and our digital platform, ROOM connects artists and audiences while creating a space for new ideas and cultural exchange.</p>
        </Block>
        <Block title="Explore More Works">
          <p>Looking for something beyond the works currently displayed?</p>
          <p>The selection presented on our website and in the space is only part of the artists&apos; practices and available works.</p>
          <p>If you are interested in seeing additional works by an artist, exploring other artworks that are not currently on display, get in touch with us. We will be happy to provide further information and share available works upon request.</p>
          <p>For artwork enquiries, please contact us via WhatsApp.</p>
        </Block>
      </section>
      <SiteFooter settings={data.settings} />
    </main>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article>
      <h2 className="room-serif text-xl md:text-2xl">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-[#6f6a61]">
        {children}
      </div>
    </article>
  );
}