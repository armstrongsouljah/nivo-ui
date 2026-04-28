"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  PowerOff,
  ChevronDown,
  ImageOff,
  Loader2,
} from "lucide-react";
import type { Product, Category } from "@/lib/api";
import { toggleProductStatusAction } from "./actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";

function priceLabel(inStock: boolean) {
  return inStock ? (
    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-500/10 text-green-400">
      In Stock
    </span>
  ) : (
    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400">
      Out of Stock
    </span>
  );
}

interface Props {
  initialProducts: Product[];
  initialCategories: Category[];
}

export default function ProductsClient({ initialProducts, initialCategories }: Props) {
  const [products, setProducts]     = useState<Product[]>(initialProducts);
  const [search, setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter]     = useState("All");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const confirm = useConfirm();

  async function handleToggleStatus(product: Product) {
    const nextState = !product.is_active;
    const confirmed = await confirm({
      title: nextState ? `Activate "${product.name}"?` : `Deactivate "${product.name}"?`,
      message: nextState
        ? "This will make the product visible in the store."
        : "This will hide the product from the store. Customers will no longer be able to find or purchase it.",
      confirmLabel: nextState ? "Activate" : "Deactivate",
      variant: nextState ? "info" : "danger",
    });
    if (!confirmed) return;

    setTogglingId(product.id);
    try {
      await toggleProductStatusAction(product.id, nextState);
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, is_active: nextState } : p)
      );
    } catch {
      alert(`Failed to ${nextState ? "activate" : "deactivate"} "${product.name}". Please try again.`);
    } finally {
      setTogglingId(null);
    }
  }

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || p.category?.slug === categoryFilter;
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Active"       &&  p.is_active) ||
      (statusFilter === "Inactive"     && !p.is_active) ||
      (statusFilter === "Out of Stock" && !p.in_stock);
    return matchSearch && matchCategory && matchStatus;
  });

  const totalActive      = products.filter((p) =>  p.is_active).length;
  const totalInactive    = products.filter((p) => !p.is_active).length;
  const totalOutOfStock  = products.filter((p) => !p.in_stock).length;

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">Products</h1>
          <p className="text-xs text-zinc-500 mt-1">
            {products.length} total &mdash; manage catalogue, variants &amp; stock
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-200 transition-colors shrink-0"
        >
          <Plus size={14} />
          New Product
        </Link>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",        value: products.length,        color: "text-white"      },
          { label: "Active",       value: totalActive,            color: "text-green-400"  },
          { label: "Inactive",     value: totalInactive,          color: "text-zinc-500"   },
          { label: "Out of Stock", value: totalOutOfStock,        color: "text-amber-400"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs pl-9 pr-4 py-2.5 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
          />
        </div>

        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 pl-3 pr-8 py-2.5 rounded-md focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            <option value="">All Categories</option>
            {initialCategories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 pl-3 pr-8 py-2.5 rounded-md focus:outline-none focus:border-zinc-600 cursor-pointer"
          >
            {["All", "Active", "Inactive", "Out of Stock"].map((s) => (
              <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Product", "Category", "Stock Status", "Visibility", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-600 text-xs">
                    No products match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((product, i) => (
                  <tr
                    key={product.id}
                    className={`hover:bg-zinc-800/40 transition-colors ${i < filtered.length - 1 ? "border-b border-zinc-800/50" : ""}`}
                  >
                    {/* Product */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
                          {product.cover_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.cover_image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageOff size={14} className="text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white leading-none">{product.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">{product.slug}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5 text-xs text-zinc-400">
                      {product.category?.name ?? <span className="text-zinc-600">—</span>}
                    </td>

                    {/* Stock status */}
                    <td className="px-5 py-3.5">{priceLabel(product.in_stock)}</td>

                    {/* Visibility */}
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        product.is_active
                          ? "bg-green-500/10 text-green-400"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/products/${product.id}/edit`} title="Edit product" className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-700 transition-colors inline-flex items-center">
                          <Pencil size={13} />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(product)}
                          disabled={togglingId === product.id}
                          title={product.is_active ? "Deactivate" : "Activate"}
                          className={`p-1.5 rounded-md transition-colors disabled:opacity-40 ${
                            product.is_active
                              ? "text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                              : "text-zinc-500 hover:text-green-400 hover:bg-green-500/10"
                          }`}
                        >
                          {togglingId === product.id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <PowerOff size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-zinc-800">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
            {filtered.length} of {initialProducts.length} products
          </p>
        </div>
      </div>
    </main>
  );
}
