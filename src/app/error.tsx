"use client";

import Link from "next/link";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Error</p>
        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tight mb-3">Something went wrong</h1>
        <p className="text-sm text-zinc-500 mb-6">We couldn&apos;t load this page. Please try again.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border border-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
