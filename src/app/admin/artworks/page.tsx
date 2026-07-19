import Link from "next/link";
import { Plus } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getSiteData } from "@/lib/site-data";
import { deleteArtwork } from "@/app/admin/actions";
import { DeleteButton } from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function AdminArtworksPage() {
  if (!(await isAdmin())) {
    return <p className="p-8 text-sm">Access denied.</p>;
  }
  const data = await getSiteData();

  return (
    <main className="min-h-screen bg-[#f4f1ea]">
      <header className="border-b border-black/10 bg-[#11100e] py-5 text-[#f4f1ea]">
        <div className="room-shell flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="section-kicker text-white/50">Admin</p>
            <h1 className="room-serif text-4xl">Artworks</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">
              Dashboard
            </Link>
            <Link href="/admin/artworks/new" className="inline-flex items-center gap-2 bg-[#f4f1ea] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#11100e]">
              <Plus size={16} /> Add artwork
            </Link>
          </div>
        </div>
      </header>

      <div className="room-shell py-8">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase tracking-[0.14em] text-[#6f6a61]">
              <th className="py-3 pr-4 font-semibold">Title</th>
              <th className="py-3 pr-4 font-semibold">Artist</th>
              <th className="py-3 pr-4 font-semibold">Year</th>
              <th className="py-3 pr-4 font-semibold">Availability</th>
              <th className="py-3 w-10 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {data.artworks.map((artwork) => (
              <tr key={artwork.slug} className="border-b border-black/5 hover:bg-white/40">
                <td className="py-3 pr-4">
                  <Link href={`/admin/artworks/${artwork.slug}`} className="font-semibold text-[#11100e] transition hover:opacity-70">
                    {artwork.title}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-[#6f6a61]">{artwork.artistSlug}</td>
                <td className="py-3 pr-4 text-[#6f6a61]">{artwork.year}</td>
                <td className="py-3 pr-4 font-mono text-xs text-[#6f6a61]">{artwork.availability}</td>
                <td className="py-3">
                  <form action={deleteArtwork.bind(null, artwork.slug)}>
                    <DeleteButton itemName={artwork.title} />
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}