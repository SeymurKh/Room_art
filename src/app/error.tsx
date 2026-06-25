"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="dark-room grid min-h-screen place-items-center px-4 text-[#f4f1ea]">
      <div className="text-center">
        <p className="section-kicker text-white/50">Error</p>
        <h1 className="room-serif mt-4 text-5xl font-medium md:text-7xl">Something went wrong</h1>
        <p className="mt-6 max-w-md text-sm leading-7 text-white/62">
          An unexpected error occurred. Please try again or return to the homepage.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 border border-white/30 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-white hover:text-black"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/78 transition hover:text-white"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}