"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-2">Page Error</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-500 mb-1">Something went wrong loading this page.</p>
        {error.digest && (
          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-600 mb-5">Digest: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-blue-600 dark:hover:bg-zinc-200 transition-colors"
          >
            <RefreshCw size={12} /> Retry
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
