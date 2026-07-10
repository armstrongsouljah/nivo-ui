"use client";

import { useState } from "react";
import { Search, AlertTriangle, Check, X, Loader2, ArrowUpDown } from "lucide-react";
import type { StockEntry } from "@/lib/api";
import { adjustStockAction, updateStockThresholdAction } from "./actions";

// ─── Inline adjust form ───────────────────────────────────────────────────────

function AdjustForm({
  entry,
  onSaved,
  onCancel,
}: {
  entry: StockEntry;
  onSaved: (updated: StockEntry) => void;
  onCancel: () => void;
}) {
  const [change, setChange] = useState("");
  const [notes, setNotes]   = useState("");
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleSave() {
    const delta = parseInt(change);
    if (isNaN(delta) || delta === 0) { setError("Enter a non-zero quantity."); return; }
    setBusy(true); setError(null);
    try {
      await adjustStockAction(entry.variant, delta, notes);
      const newQty = Math.max(0, entry.quantity + delta);
      onSaved({ ...entry, quantity: newQty, is_low_stock: newQty <= entry.low_stock_threshold });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to adjust stock.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="number"
        value={change}
        onChange={(e) => setChange(e.target.value)}
        placeholder="±qty"
        className="w-20 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs px-2 py-1.5 rounded-md focus:outline-none focus:border-zinc-500"
      />
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Reason (optional)"
        className="flex-1 min-w-24 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs px-2 py-1.5 rounded-md focus:outline-none focus:border-zinc-500"
      />
      <button onClick={handleSave} disabled={busy}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 text-white dark:bg-white dark:text-black text-xs font-bold rounded-md hover:bg-blue-600 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors">
        {busy ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
      </button>
      <button onClick={onCancel}
        className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors">
        <X size={13} />
      </button>
      {error && <p className="w-full text-[11px] text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function StockClient({ initial }: { initial: StockEntry[] }) {
  const [entries, setEntries]     = useState<StockEntry[]>(initial);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<"all" | "low" | "out">("all");
  const [adjustingId, setAdjustingId] = useState<number | null>(null);

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || e.product_name?.toLowerCase().includes(q)
      || e.variant_sku?.toLowerCase().includes(q)
      || e.age_group?.toLowerCase().includes(q);
    const matchFilter =
      filter === "all" ? true :
      filter === "low" ? e.is_low_stock && e.quantity > 0 :
      e.quantity === 0;
    return matchSearch && matchFilter;
  });

  const lowCount = entries.filter((e) => e.is_low_stock && e.quantity > 0).length;
  const outCount = entries.filter((e) => e.quantity === 0).length;

  function updateEntry(updated: StockEntry) {
    setEntries((prev) => prev.map((e) => e.id === updated.id ? updated : e));
    setAdjustingId(null);
  }

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-500 uppercase mb-1">Inventory</p>
        <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Stock</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">{entries.length} variant{entries.length !== 1 ? "s" : ""} tracked</p>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "all",  label: "All",      count: entries.length, color: "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800" },
          { key: "low",  label: "Low stock", count: lowCount,       color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" },
          { key: "out",  label: "Out",       count: outCount,       color: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" },
        ].map(({ key, label, count, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors ${
              filter === key ? "bg-zinc-900 text-white dark:bg-white dark:text-black" : color
            }`}
          >
            {label}
            {count > 0 && <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-black/10">{count}</span>}
          </button>
        ))}

        <div className="relative ml-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search product or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs pl-8 pr-3 py-2 rounded-md w-52 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl py-16 text-center text-zinc-500 dark:text-zinc-600 text-sm">
          {search || filter !== "all" ? "No variants match your filters." : "No stock entries yet."}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                {["Product", "SKU", "Age Group", "Qty", "Threshold", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest py-3 px-4 first:pl-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <>
                  <tr key={entry.id} className="border-b border-zinc-200/70 dark:border-zinc-800/50 last:border-b-0 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 pl-5 font-semibold text-zinc-900 dark:text-white">{entry.product_name ?? "—"}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-500">{entry.variant_sku}</td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 text-xs">{entry.age_group}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-black ${
                        entry.quantity === 0 ? "text-red-600 dark:text-red-400" :
                        entry.is_low_stock ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-white"
                      }`}>{entry.quantity}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-500 text-xs">{entry.low_stock_threshold}</td>
                    <td className="py-3 px-4">
                      {entry.quantity === 0 ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                          <AlertTriangle size={11} /> Out of stock
                        </span>
                      ) : entry.is_low_stock ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          <AlertTriangle size={11} /> Low stock
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">In stock</span>
                      )}
                    </td>
                    <td className="py-3 px-4 pr-5 text-right">
                      <button
                        onClick={() => setAdjustingId((prev) => prev === entry.id ? null : entry.id)}
                        className="flex items-center gap-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors ml-auto"
                      >
                        <ArrowUpDown size={12} /> Adjust
                      </button>
                    </td>
                  </tr>
                  {adjustingId === entry.id && (
                    <tr key={`${entry.id}-adjust`} className="border-b border-zinc-200/70 dark:border-zinc-800/50 bg-zinc-100/40 dark:bg-zinc-800/20">
                      <td colSpan={7} className="px-5 py-3">
                        <AdjustForm
                          entry={entry}
                          onSaved={updateEntry}
                          onCancel={() => setAdjustingId(null)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
