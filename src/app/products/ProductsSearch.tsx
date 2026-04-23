"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { Category } from "@/lib/api";

interface Props {
  categories: Category[];
  initialQ?: string;
  initialCategory?: string;
}

export default function ProductsSearch({ categories, initialQ, initialCategory }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(initialQ ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function push(newQ: string, newCategory: string | undefined) {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newCategory) params.set("category", newCategory);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearch(value: string) {
    setQ(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      push(value, searchParams.get("category") ?? undefined);
    }, 400);
  }

  function handleCategory(slug: string | undefined) {
    push(q, slug);
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const activeCategory = searchParams.get("category") ?? undefined;

  return (
    <div className="mb-8 flex flex-col gap-4">
      {/* Search input */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-zinc-200 focus:border-zinc-900 outline-none transition-colors"
        />
        {q && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategory(undefined)}
            className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 border transition-colors ${
              !activeCategory
                ? "bg-zinc-900 text-white border-zinc-900"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategory(activeCategory === cat.slug ? undefined : cat.slug)}
              className={`text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                activeCategory === cat.slug
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
