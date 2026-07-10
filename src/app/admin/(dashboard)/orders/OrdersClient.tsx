"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import type { OrderSummary } from "@/lib/api";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_TABS = ["All", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"] as const;

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  confirmed:  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  processing: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  shipped:    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  delivered:  "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled:  "bg-red-500/10 text-red-600 dark:text-red-400",
  refunded:   "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_STYLES[status] ?? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
      {status}
    </span>
  );
}

function fmtPrice(v: string) {
  return `UGX ${parseFloat(v).toLocaleString("en-UG")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrdersClient({ initial }: { initial: OrderSummary[] }) {
  const [orders, setOrders] = useState<OrderSummary[]>(initial);
  const [search, setSearch] = useState("");
  const [tab, setTab]       = useState<string>("All");

  const filtered = orders.filter((o) => {
    const matchStatus = tab === "All" || o.status === tab;
    const q = search.toLowerCase();
    const matchSearch = !q
      || (o.secure_code?.toLowerCase().includes(q) ?? false)
      || o.id.toLowerCase().includes(q)
      || o.total_price.includes(q);
    return matchStatus && matchSearch;
  });

  // Keep counts for tab badges
  const countByStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-500 uppercase mb-1">Management</p>
        <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Orders</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by code or order ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm pl-8 pr-3.5 py-2 rounded-md placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
        />
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {STATUS_TABS.map((s) => {
          const count = s === "All" ? orders.length : (countByStatus[s] ?? 0);
          const active = tab === s;
          return (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors ${
                active ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {s === "All" ? "All" : s}
              {count > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${active ? "bg-black/20 text-black" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl py-16 text-center text-zinc-500 dark:text-zinc-600 text-sm">
          {search ? "No orders match your search." : "No orders yet."}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  {["Code", "Order ID", "Total", "Paid", "Status", "Date", ""].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest py-3 px-4 first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-200/70 dark:border-zinc-800/50 last:border-b-0 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <td className="py-3.5 px-4 pl-5">
                      <span className="font-black text-zinc-900 dark:text-white tracking-widest">
                        {order.secure_code ?? "—"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-500">
                        {order.id.slice(0, 8)}…
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-white">
                      {fmtPrice(order.total_price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${order.is_paid ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-500"}`}>
                        {order.is_paid ? "Paid" : "COD"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-500 text-xs">
                      {fmtDate(order.created_at)}
                    </td>
                    <td className="py-3.5 px-4 pr-5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                      >
                        View <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
