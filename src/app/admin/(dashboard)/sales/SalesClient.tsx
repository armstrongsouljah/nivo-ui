"use client";

import { useState } from "react";
import { Plus, X, Check, Loader2, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import type { SaleListItem, SaleDetail, SaleCreatePayload, SalesSummary, StockEntry } from "@/lib/api";
import { recordSaleAction, fetchSalesAction, fetchSalesSummaryAction, getSaleDetailAction } from "./actions";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return `UGX ${n.toLocaleString("en-UG")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Item picker ───────────────────────────────────────────────────────────────

interface ItemRowState {
  key: string;
  query: string;
  variant: StockEntry | null;
  quantity: string;
  price: string;
}

function newItemRow(): ItemRowState {
  return { key: Math.random().toString(36).slice(2), query: "", variant: null, quantity: "1", price: "" };
}

function ItemRow({
  row,
  stockEntries,
  onChange,
  onRemove,
  showRemove,
}: {
  row: ItemRowState;
  stockEntries: StockEntry[];
  onChange: (row: ItemRowState) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const [open, setOpen] = useState(false);

  const q = row.query.trim().toLowerCase();
  const suggestions = (q
    ? stockEntries.filter((e) =>
        e.product_name?.toLowerCase().includes(q) || e.variant_sku?.toLowerCase().includes(q)
      )
    : stockEntries
  ).slice(0, 8);

  const overStock = !!row.variant && !!row.quantity && parseInt(row.quantity, 10) > row.variant.quantity;

  return (
    <div className="flex items-start gap-2 flex-wrap sm:flex-nowrap">
      <div className="relative flex-1 min-w-[200px]">
        <input
          type="text"
          value={row.query}
          onChange={(e) => onChange({ ...row, query: e.target.value, variant: null })}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search product or SKU…"
          className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs px-2.5 py-2 rounded-md focus:outline-none focus:border-zinc-500"
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-md shadow-lg">
            {suggestions.map((e) => (
              <button
                type="button"
                key={e.id}
                onMouseDown={(ev) => ev.preventDefault()}
                onClick={() => {
                  onChange({ ...row, variant: e, query: `${e.product_name ?? "—"} — ${e.variant_sku}` });
                  setOpen(false);
                }}
                className="w-full text-left px-2.5 py-2 text-xs hover:bg-zinc-700 transition-colors flex items-center justify-between gap-2"
              >
                <span className="text-white font-semibold truncate">
                  {e.product_name ?? "—"} <span className="text-zinc-500 font-mono">{e.variant_sku}</span>
                </span>
                <span
                  className={`shrink-0 text-[10px] font-bold ${
                    e.quantity === 0 ? "text-red-400" : e.is_low_stock ? "text-amber-400" : "text-zinc-500"
                  }`}
                >
                  {e.quantity} in stock
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        type="number"
        min={1}
        step={1}
        value={row.quantity}
        onChange={(e) => onChange({ ...row, quantity: e.target.value })}
        placeholder="Qty"
        className="w-20 bg-zinc-800 border border-zinc-700 text-white text-xs px-2.5 py-2 rounded-md focus:outline-none focus:border-zinc-500"
      />

      <input
        type="number"
        min={0}
        step={100}
        value={row.price}
        onChange={(e) => onChange({ ...row, price: e.target.value })}
        placeholder="Price (optional)"
        className="w-32 bg-zinc-800 border border-zinc-700 text-white text-xs px-2.5 py-2 rounded-md focus:outline-none focus:border-zinc-500"
      />

      {showRemove && (
        <button type="button" onClick={onRemove} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
          <Trash2 size={14} />
        </button>
      )}

      {overStock && <p className="w-full text-[11px] text-amber-400">Only {row.variant!.quantity} in stock.</p>}
    </div>
  );
}

// ─── Record sale form ──────────────────────────────────────────────────────────

function RecordSaleForm({
  stockEntries,
  onRecorded,
  onCancel,
}: {
  stockEntries: StockEntry[];
  onRecorded: (sale: SaleDetail, soldQuantities: Record<string, number>) => void;
  onCancel: () => void;
}) {
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ItemRowState[]>([newItemRow()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(key: string, updated: ItemRowState) {
    setRows((prev) => prev.map((r) => (r.key === key ? updated : r)));
  }
  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validRows = rows.filter((r) => r.variant && r.quantity);
    if (validRows.length === 0) { setError("Add at least one item."); return; }

    for (const r of validRows) {
      const qty = parseInt(r.quantity, 10);
      if (isNaN(qty) || qty <= 0) { setError("Quantities must be positive numbers."); return; }
      if (qty > r.variant!.quantity) {
        setError(`Only ${r.variant!.quantity} in stock for ${r.variant!.product_name ?? r.variant!.variant_sku}.`);
        return;
      }
    }

    setBusy(true);
    try {
      const payload: SaleCreatePayload = {
        notes: notes.trim() || undefined,
        items: validRows.map((r) => ({
          product_variant: r.variant!.variant,
          quantity: parseInt(r.quantity, 10),
          ...(r.price.trim() ? { price_at_sale: r.price.trim() } : {}),
        })),
      };
      const sale = await recordSaleAction(payload);

      const soldQuantities: Record<string, number> = {};
      for (const r of validRows) {
        const qty = parseInt(r.quantity, 10);
        soldQuantities[r.variant!.variant] = (soldQuantities[r.variant!.variant] ?? 0) + qty;
      }

      onRecorded(sale, soldQuantities);
      setNotes("");
      setRows([newItemRow()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record sale.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Record a Sale</h3>
        <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-white transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <ItemRow
            key={row.key}
            row={row}
            stockEntries={stockEntries}
            onChange={(updated) => updateRow(row.key, updated)}
            onRemove={() => removeRow(row.key)}
            showRemove={rows.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, newItemRow()])}
        className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-white transition-colors"
      >
        <Plus size={12} /> Add item
      </button>

      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="w-full bg-zinc-800 border border-zinc-700 text-white text-xs px-3 py-2 rounded-md placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
      />

      {error && <p className="text-[11px] text-red-400">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={busy}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-200 disabled:opacity-40 transition-colors"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          Record Sale
        </button>
      </div>
    </form>
  );
}

// ─── Sale row ──────────────────────────────────────────────────────────────────

function SaleRow({
  sale,
  detail,
  onExpand,
}: {
  sale: SaleListItem;
  detail?: SaleDetail;
  onExpand: () => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!expanded && !detail) {
      setLoading(true);
      await onExpand();
      setLoading(false);
    }
    setExpanded((v) => !v);
  }

  return (
    <>
      <tr className="border-b border-zinc-800/50 last:border-b-0 hover:bg-zinc-800/30 transition-colors">
        <td className="py-3 px-4 pl-5 text-zinc-400 text-xs">{fmtDate(sale.created_at)}</td>
        <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">{sale.id.slice(0, 8)}…</td>
        <td className="py-3 px-4 font-semibold text-white">{fmtPrice(sale.total_amount)}</td>
        <td className="py-3 px-4 text-zinc-400 text-xs truncate max-w-[220px]">{sale.notes || "—"}</td>
        <td className="py-3 px-4 pr-5 text-right">
          <button
            onClick={toggle}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 hover:text-white transition-colors"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            Items
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-zinc-800/50 bg-zinc-800/20">
          <td colSpan={5} className="px-5 py-3">
            {detail ? (
              <div className="space-y-1.5">
                {detail.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">
                      {item.quantity} × <span className="font-mono text-zinc-500">{item.variant_sku}</span>
                    </span>
                    <span className="text-zinc-400">
                      {fmtPrice(item.price_at_sale)} each · <span className="text-white font-semibold">{fmtPrice(item.subtotal)}</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-600 italic">Couldn&apos;t load items.</p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

type Preset = "week" | "month" | "all" | "custom";

export default function SalesClient({
  initialSales,
  initialSummary,
  stockEntries: initialStockEntries,
}: {
  initialSales: SaleListItem[];
  initialSummary: SalesSummary | null;
  stockEntries: StockEntry[];
}) {
  const [sales, setSales] = useState<SaleListItem[]>(initialSales);
  const [summary, setSummary] = useState<SalesSummary | null>(initialSummary);
  const [stockEntries, setStockEntries] = useState<StockEntry[]>(initialStockEntries);
  const [detailCache, setDetailCache] = useState<Record<string, SaleDetail>>({});
  const [preset, setPreset] = useState<Preset>("week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function applyPreset(p: Preset, start?: string, end?: string) {
    setPreset(p);
    setLoading(true);
    try {
      const summaryParams =
        p === "custom" ? { start_date: start || undefined, end_date: end || undefined } :
        p === "all" ? {} : { period: p };
      const newSummary = await fetchSalesSummaryAction(summaryParams);
      setSummary(newSummary);

      const listParams =
        p === "custom" ? { start_date: start || undefined, end_date: end || undefined } :
        p === "all" ? {} : { start_date: newSummary.start_date ?? undefined };
      const newSales = await fetchSalesAction(listParams);
      setSales(newSales);
    } catch {
      // keep previous state if the refetch fails
    } finally {
      setLoading(false);
    }
  }

  function handleRecorded(sale: SaleDetail, soldQuantities: Record<string, number>) {
    setSales((prev) => [sale, ...prev]);
    setDetailCache((prev) => ({ ...prev, [sale.id]: sale }));
    setStockEntries((prev) =>
      prev.map((e) => {
        const sold = soldQuantities[e.variant];
        if (!sold) return e;
        const newQty = Math.max(0, e.quantity - sold);
        return { ...e, quantity: newQty, is_low_stock: newQty <= e.low_stock_threshold };
      })
    );
    setShowForm(false);
    applyPreset(preset, customStart, customEnd);
  }

  async function loadDetail(id: string) {
    if (detailCache[id]) return;
    try {
      const detail = await getSaleDetailAction(id);
      setDetailCache((prev) => ({ ...prev, [id]: detail }));
    } catch {
      // row will show a fallback message
    }
  }

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-1">Point of Sale</p>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">Sales</h1>
          <p className="text-xs text-zinc-500 mt-1">{sales.length} sale{sales.length !== 1 ? "s" : ""} in view</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-zinc-200 transition-colors"
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? "Cancel" : "Record Sale"}
        </button>
      </div>

      {/* Record form */}
      {showForm && (
        <div className="mb-6">
          <RecordSaleForm stockEntries={stockEntries} onRecorded={handleRecorded} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Total sales</p>
          <p className="text-2xl font-black text-white">{summary?.total_sales ?? "—"}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Revenue</p>
          <p className="text-2xl font-black text-white">{summary ? fmtPrice(summary.total_revenue) : "—"}</p>
        </div>
      </div>

      {/* Period filter */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {(["week", "month", "all"] as const).map((p) => (
          <button
            key={p}
            onClick={() => applyPreset(p)}
            className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors ${
              preset === p ? "bg-white text-black" : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
            }`}
          >
            {p === "week" ? "This week" : p === "month" ? "This month" : "All time"}
          </button>
        ))}
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white text-xs px-2.5 py-1.5 rounded-md focus:outline-none focus:border-zinc-500"
          />
          <span className="text-zinc-600 text-xs">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-white text-xs px-2.5 py-1.5 rounded-md focus:outline-none focus:border-zinc-500"
          />
          <button
            onClick={() => applyPreset("custom", customStart, customEnd)}
            disabled={!customStart && !customEnd}
            className="px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 disabled:opacity-40 transition-colors"
          >
            Apply
          </button>
        </div>
        {loading && <Loader2 size={13} className="animate-spin text-zinc-500" />}
      </div>

      {/* Table */}
      {sales.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-xl py-16 text-center text-zinc-600 text-sm">
          No sales recorded for this period.
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Date", "Sale ID", "Total", "Notes", ""].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-3 px-4 first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <SaleRow key={sale.id} sale={sale} detail={detailCache[sale.id]} onExpand={() => loadDetail(sale.id)} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
