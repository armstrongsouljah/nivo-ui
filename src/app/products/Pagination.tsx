"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
}

export default function Pagination({ page, totalPages }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function pageHref(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) params.delete("page");
    else params.set("page", String(p));
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }

  const pages = buildPageRange(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 mt-12" aria-label="Pagination">
      <Link
        href={pageHref(page - 1)}
        aria-disabled={page === 1}
        className={`p-2 border border-zinc-200 transition-colors ${
          page === 1 ? "pointer-events-none text-zinc-300" : "text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
        }`}
      >
        <ChevronLeft size={16} />
      </Link>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-zinc-400 text-sm">…</span>
        ) : (
          <Link
            key={p}
            href={pageHref(p as number)}
            className={`min-w-[36px] h-9 flex items-center justify-center text-xs font-bold tracking-wide border transition-colors ${
              p === page
                ? "bg-zinc-900 text-white border-zinc-900"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={pageHref(page + 1)}
        aria-disabled={page === totalPages}
        className={`p-2 border border-zinc-200 transition-colors ${
          page === totalPages ? "pointer-events-none text-zinc-300" : "text-zinc-600 hover:border-zinc-900 hover:text-zinc-900"
        }`}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}

function buildPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}
