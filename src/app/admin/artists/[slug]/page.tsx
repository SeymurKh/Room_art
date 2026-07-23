import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getSiteData } from "@/lib/site-data";
import { saveArtist, createArtist, deleteArtwork } from "@/app/admin/actions";
import { DeleteButton } from "@/components/delete-button";
import { ArtistForm } from "./ArtistForm";
import type { Artist } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; saved?: string; details?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { slug } = await params;
  const sp = await searchParams;
  const isNew = slug === "new";

  const data = await getSiteData();
  const artist = isNew ? null : data.artists.find((a) => a.slug === slug);
  if (!isNew && !artist) notFound();

  const defaults: Artist = artist ?? {
    slug: "",
    name: "",
    role: "",
    portrait: "",
    bio: "",
    statement: "",
  };

  const errorMsg =
    sp.error === "validation" && sp.details
      ? `Validation: ${decodeURIComponent(sp.details)}`
      : sp.error === "json"
        ? "Invalid JSON."
        : null;

  const saveAction = isNew ? createArtist : saveArtist;

  const artistArtworks = artist ? data.artworks.filter((aw) => aw.artistSlug === artist.slug) : [];

  return (
    <main className="min-h-screen bg-[#f4f1ea]">
      <header className="border-b border-black/10 bg-[#11100e] py-5 text-[#f4f1ea]">
        <div className="room-shell flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/artists" className="border border-white/20 p-2" aria-label="Back to artists list" title="Back to artists list">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="section-kicker text-white/50">{isNew ? "New" : "Edit"}</p>
              <h1 className="room-serif text-4xl">{isNew ? "Create artist" : artist!.name}</h1>
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

        <ArtistForm defaults={defaults} />
      </form>

      {artist ? (
        <div className="room-shell pb-12">
          <div className="flex items-center justify-between border-t border-black/10 pt-10">
            <h2 className="room-serif text-4xl">Artworks</h2>
            <Link
              href={`/admin/artworks/new?artist=${artist.slug}`}
              className="inline-flex items-center gap-2 border border-black/14 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]"
            >
              <Plus size={16} /> Add artwork
            </Link>
          </div>
          {artistArtworks.length === 0 ? (
            <p className="mt-6 text-sm text-[#6f6a61]">No artworks yet for this artist.</p>
          ) : (
            <table className="mt-6 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs uppercase tracking-[0.14em] text-[#6f6a61]">
                  <th className="py-3 pr-4 font-semibold">Title</th>
                  <th className="py-3 pr-4 font-semibold">Year</th>
                  <th className="py-3 pr-4 font-semibold">Availability</th>
                  <th className="py-3 w-10 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {artistArtworks.map((artwork) => (
                  <tr key={artwork.slug} className="border-b border-black/5 hover:bg-white/40">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/artworks/${artwork.slug}`} className="font-semibold text-[#11100e] transition hover:opacity-70">
                        {artwork.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-[#6f6a61]">{artwork.year}</td>
                    <td className="py-3 pr-4 text-xs text-[#6f6a61]">{artwork.availability}</td>
                    <td className="py-3">
                      <form action={deleteArtwork.bind(null, artwork.slug)}>
                        <DeleteButton itemName={artwork.title} />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : null}
    </main>
  );
}