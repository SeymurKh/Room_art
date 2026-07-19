import Link from "next/link";
import { Plus } from "lucide-react";
import { isAdmin } from "@/lib/auth";
import { getSiteData } from "@/lib/site-data";
import { deleteArtist } from "@/app/admin/actions";
import { DeleteButton } from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function AdminArtistsPage() {
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
            <h1 className="room-serif text-4xl">Artists</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="border border-white/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em]">
              Dashboard
            </Link>
            <Link href="/admin/artists/new" className="inline-flex items-center gap-2 border border-black/40 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#11100e] transition hover:bg-black/5">
              <Plus size={16} /> Add artist
            </Link>
          </div>
        </div>
      </header>

      <div className="room-shell py-8">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-black/10 text-xs uppercase tracking-[0.14em] text-[#6f6a61]">
              <th className="py-3 pr-4 font-semibold">Name</th>
              <th className="py-3 pr-4 font-semibold">Role</th>
              <th className="py-3 pr-4 font-semibold">Slug</th>
              <th className="py-3 w-10 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {data.artists.map((artist) => (
              <tr key={artist.slug} className="border-b border-black/5 hover:bg-white/40">
                <td className="py-3 pr-4">
                  <Link href={`/admin/artists/${artist.slug}`} className="font-semibold text-[#11100e] transition hover:opacity-70">
                    {artist.name}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-[#6f6a61]">{artist.role}</td>
                <td className="py-3 pr-4 font-mono text-xs text-[#6f6a61]">{artist.slug}</td>
                <td className="py-3">
                  <form action={deleteArtist.bind(null, artist.slug)}>
                    <DeleteButton itemName={artist.name} />
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