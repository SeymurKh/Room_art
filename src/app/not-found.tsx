import Link from "next/link";

export default function NotFound() {
  return (
    <main className="dark-room grid min-h-screen place-items-center px-4 text-[#f4f1ea]">
      <div className="text-center">
        <p className="section-kicker text-white/50">404</p>
        <h1 className="room-serif mt-4 text-6xl font-medium md:text-8xl">Page not found</h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-white/62">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex items-center gap-2 border border-white/20 px-6 py-4 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-black"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}