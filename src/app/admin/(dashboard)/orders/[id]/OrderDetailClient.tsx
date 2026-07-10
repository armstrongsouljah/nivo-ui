"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import type { OrderDetail } from "@/lib/api";
import { updateOrderStatusAction, markOrderPaidAction } from "../actions";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  confirmed:  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  processing: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  shipped:    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  delivered:  "bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled:  "bg-red-500/10 text-red-600 dark:text-red-400",
  refunded:   "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

// Valid forward transitions for each status
const TRANSITIONS: Record<string, { label: string; status: string; variant: "primary" | "danger" | "neutral" }[]> = {
  pending:    [
    { label: "Confirm Order",  status: "confirmed",  variant: "primary"  },
    { label: "Cancel Order",   status: "cancelled",  variant: "danger"   },
  ],
  confirmed:  [
    { label: "Mark Processing", status: "processing", variant: "primary"  },
    { label: "Cancel Order",    status: "cancelled",  variant: "danger"   },
  ],
  processing: [
    { label: "Mark Shipped",   status: "shipped",    variant: "primary"  },
    { label: "Cancel Order",   status: "cancelled",  variant: "danger"   },
  ],
  shipped:    [
    { label: "Mark Delivered", status: "delivered",  variant: "primary"  },
  ],
  delivered:  [
    { label: "Issue Refund",   status: "refunded",   variant: "neutral"  },
  ],
  cancelled:  [],
  refunded:   [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(v: string | number) {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return `UGX ${n.toLocaleString("en-UG")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-UG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${STATUS_STYLES[status] ?? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
      {status}
    </span>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6">
      <h3 className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrderDetailClient({ order: initial }: { order: OrderDetail }) {
  const [order, setOrder]       = useState<OrderDetail>(initial);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [paidBusy, setPaidBusy]   = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const transitions = TRANSITIONS[order.status] ?? [];
  const addr = order.shipping_address;

  async function handleStatusChange(status: string) {
    setActionBusy(status);
    setError(null);
    try {
      const updated = await updateOrderStatusAction(order.id, status);
      setOrder(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      setActionBusy(null);
    }
  }

  async function handleTogglePaid() {
    setPaidBusy(true);
    setError(null);
    try {
      const updated = await markOrderPaidAction(order.id, !order.is_paid);
      setOrder(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update payment status.");
    } finally {
      setPaidBusy(false);
    }
  }

  const subtotal = order.items.reduce((s, i) => s + Number(i.subtotal ?? parseFloat(i.price_at_purchase) * i.quantity), 0);

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Back */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white uppercase tracking-widest transition-colors mb-6"
      >
        <ArrowLeft size={13} /> Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            {order.secure_code && (
              <span className="text-2xl font-black text-zinc-900 dark:text-white tracking-[0.15em]">
                {order.secure_code}
              </span>
            )}
            <StatusBadge status={order.status} />
          </div>
          {/* <p className="font-mono text-[11px] text-zinc-500 dark:text-zinc-600">{order.id}</p> */}
          <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">{fmtDate(order.created_at)}</p>
        </div>

        {/* Paid toggle */}
        <button
          type="button"
          onClick={handleTogglePaid}
          disabled={paidBusy}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${
            order.is_paid
              ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          {paidBusy ? <Loader2 size={12} className="animate-spin" /> : order.is_paid ? <Check size={12} /> : null}
          {order.is_paid ? "Paid" : "Mark as Paid"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Items */}
          <SectionCard title={`Items (${order.items.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    {["Item", "Qty", "Unit Price", "Subtotal"].map((h) => (
                      <th key={h} className="text-left text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest pb-3 pr-4 last:text-right last:pr-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-200/70 dark:border-zinc-800/50 last:border-b-0">
                      <td className="py-3 pr-4 text-zinc-900 dark:text-white font-medium">
                        {item.variant_label || "—"}
                      </td>
                      <td className="py-3 pr-4 text-zinc-600 dark:text-zinc-400">{item.quantity}</td>
                      <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">{fmtPrice(item.price_at_purchase)}</td>
                      <td className="py-3 text-right font-semibold text-zinc-900 dark:text-white">
                        {fmtPrice(parseFloat(item.price_at_purchase) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                <span>Subtotal</span><span>{fmtPrice(subtotal)}</span>
              </div>
              {parseFloat(order.shipping_cost) > 0 && (
                <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
                  <span>Shipping</span><span>{fmtPrice(order.shipping_cost)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-zinc-900 dark:text-white pt-1.5 border-t border-zinc-200 dark:border-zinc-800">
                <span>Total</span><span>{fmtPrice(order.total_price)}</span>
              </div>
            </div>
          </SectionCard>

          {/* Status actions */}
          {(transitions.length > 0 || error) && (
            <SectionCard title="Actions">
              {error && (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mb-4 bg-red-500/10 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {transitions.map(({ label, status, variant }) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={!!actionBusy}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${
                      variant === "primary" ? "bg-blue-500 text-white dark:bg-white dark:text-black hover:bg-blue-600 dark:hover:bg-zinc-200"
                      : variant === "danger" ? "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border border-red-500/20"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {actionBusy === status && <Loader2 size={12} className="animate-spin" />}
                    {label}
                  </button>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Customer / delivery */}
          <SectionCard title="Delivery Details">
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Name</p>
                <p className="text-zinc-900 dark:text-white font-semibold">{addr?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Phone</p>
                <p className="text-zinc-900 dark:text-white">{addr?.phone || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Address</p>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {[addr?.address_line_1, addr?.address_line_2, addr?.city, addr?.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Order meta */}
          <SectionCard title="Order Info">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-500">Payment</span>
                <span className={`font-semibold ${order.is_paid ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {order.is_paid ? "Paid" : "Cash on Delivery"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-500">Status</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-500">Placed</span>
                <span className="text-zinc-700 dark:text-zinc-300 text-xs">{fmtDate(order.created_at)}</span>
              </div>
              {order.updated_at !== order.created_at && (
                <div className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-500">Updated</span>
                  <span className="text-zinc-700 dark:text-zinc-300 text-xs">{fmtDate(order.updated_at)}</span>
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
