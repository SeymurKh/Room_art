import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getSiteData } from "@/lib/site-data";
import { saveArtwork, createArtwork } from "@/app/admin/actions";
import { ArtworkForm } from "./ArtworkForm";
import type { Artwork } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminArtworkPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; saved?: string; details?: string; artist?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { slug } = await params;
  const sp = await searchParams;
  const isNew = slug === "new";

  const data = await getSiteData();
  const artwork = isNew ? null : data.artworks.find((a) => a.slug === slug);
  if (!isNew && !artwork) notFound();

  const preselectedArtistSlug = isNew ? (sp.artist ?? "") : (artwork?.artistSlug ?? "");

  const defaults: Artwork = artwork ?? {
    slug: `artwork-${Date.now()}`,
    title: "",
    artistSlug: preselectedArtistSlug,
    year: String(new Date().getFullYear()),
    medium: "",
    category: "",
    dimensions: "",
    widthCm: 0,
    heightCm: 0,
    image: "",
    availability: "Available",
    description: "",
  };

  const backHref = artwork?.artistSlug ? `/admin/artists/${artwork.artistSlug}` : "/admin/artists";

  const errorMsg =
    sp.error === "validation" && sp.details
      ? `Validation: ${decodeURIComponent(sp.details)}`
      : sp.error === "json"
        ? "Invalid JSON."
        : null;

  const saveAction = isNew ? createArtwork : saveArtwork;

  return (
    <main className="min-h-screen bg-[#f4f1ea]">
      <header className="border-b border-black/10 bg-[#11100e] py-5 text-[#f4f1ea]">
        <div className="room-shell flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href={backHref} className="border border-white/20 p-2" aria-label="Back" title="Back">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="section-kicker text-white/50">{isNew ? "New" : "Edit"}</p>
              <h1 className="room-serif text-4xl">{isNew ? "Create artwork" : artwork!.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <form action={saveAction} className="room-shell py-8">
        <input type="hidden" name="slug" value={defaults.slug} readOnly />
        <input type="hidden" name="payload" id="payload" value={JSON.stringify(defaults)} readOnly />

        {sp.saved === "1" ? (
          <div className="mb-6 border border-black/10 bg-white/50 px-4 py-3 text-sm">Saved.</div>
        ) : null}
        {errorMsg ? (
          <div className="mb-6 inline-flex items-start gap-2 border border-red-400/30 bg-red-50/70 px-4 py-3 text-sm text-red-800">
            <span className="mt-0.5 shrink-0">⚠</span> {errorMsg}
          </div>
        ) : null}

        <ArtworkForm defaults={defaults} artists={data.artists} preselectedArtist={!!preselectedArtistSlug && isNew} />
      </form>
    </main>
  );
}