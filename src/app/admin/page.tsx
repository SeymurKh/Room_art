import { loginAdmin } from "@/app/admin/actions";
import { AdminDashboard } from "@/components/admin-dashboard";
import { isAdmin } from "@/lib/auth";
import { getSiteData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const params = await searchParams;
  const authed = await isAdmin();
  if (!authed) {
    return (
      <main className="dark-room grid min-h-screen place-items-center px-4 text-[#f4f1ea]">
        <form action={loginAdmin} className="w-full max-w-md border border-white/12 bg-black/30 p-8 backdrop-blur">
          <p className="section-kicker text-white/50">ROOM admin</p>
          <h1 className="room-serif mt-3 text-5xl">Sign in</h1>
          <input className="mt-8 w-full border border-white/16 bg-white/8 px-4 py-4 outline-none" name="password" type="password" placeholder="Admin password" />
          {params.error ? <p className="mt-4 text-sm text-[#d4b272]">Incorrect password.</p> : null}
          <button className="mt-6 w-full bg-[#f4f1ea] px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#11100e]">
            Enter admin panel
          </button>
          <p className="mt-5 text-xs leading-5 text-white/45">Default local password: room-admin. Set ADMIN_PASSWORD before production.</p>
        </form>
      </main>
    );
  }

  const data = await getSiteData();
  return <AdminDashboard initialData={data} saved={params.saved === "1"} />;
}
