"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, MessageCircle, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { InvoiceListItem, InvoiceStatus } from "@/lib/api";
import { updateInvoiceStatusAction, deleteInvoiceAction } from "./actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Public proxy route (src/app/invoices/[shortCode]/pdf/route.ts) — keeps the
// shared link on our own domain instead of exposing the backend API host.
function pdfPath(shortCode: string) {
  return `/invoices/${shortCode}/pdf`;
}

function absolutePdfUrl(shortCode: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${pdfPath(shortCode)}`;
}

function fmtPrice(v: string) {
  return `UGX ${parseFloat(v).toLocaleString("en-UG")}`;
}

// Local Ugandan numbers are stored as "0XXXXXXXXX"; wa.me needs the full
// international form with no leading zero (e.g. "2567XXXXXXXX"). Walk-in POS
// customers with no real number get a "walkin-<hex>" placeholder (see
// sales/serializers.py on the backend) — not a phone number, skip it.
function normalizePhoneForWhatsApp(phone: string): string | null {
  if (!phone || phone.startsWith("walkin-")) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("256")) return digits;
  if (digits.startsWith("0")) return `256${digits.slice(1)}`;
  return digits;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  pending:  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  paid:     "bg-green-500/10 text-green-600 dark:text-green-400",
  refunded: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
};

const STATUS_OPTIONS: InvoiceStatus[] = ["pending", "paid", "refunded"];

// ─── Status select ───────────────────────────────────────────────────────────

function StatusSelect({ invoice, onChanged }: { invoice: InvoiceListItem; onChanged: (i: InvoiceListItem) => void }) {
  const [busy, setBusy] = useState(false);

  async function handleChange(status: InvoiceStatus) {
    if (status === invoice.status) return;
    setBusy(true);
    try {
      const updated = await updateInvoiceStatusAction(invoice.short_code, status);
      onChanged({ ...invoice, status: updated.status });
    } catch {
      // leave status unchanged on failure — select reverts since it's controlled by invoice.status
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        aria-label="Invoice status"
        value={invoice.status}
        disabled={busy}
        onChange={(e) => handleChange(e.target.value as InvoiceStatus)}
        className={`appearance-none text-[10px] font-bold uppercase tracking-wider pl-2.5 pr-6 py-1 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white disabled:opacity-50 ${STATUS_STYLES[invoice.status]}`}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
            {s}
          </option>
        ))}
      </select>
      {busy && <Loader2 size={11} className="animate-spin absolute right-1.5 pointer-events-none" />}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export default function InvoicesClient({
  initial,
  count: initialCount,
  page,
  pageSize,
}: {
  initial: InvoiceListItem[];
  count: number;
  page: number;
  pageSize: number;
}) {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>(initial);
  const [count, setCount] = useState(initialCount);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const confirm = useConfirm();

  // `initial`/`initialCount` are fresh server-fetched props on every ?page=
  // navigation, but useState only seeds from them on first mount — without
  // this, clicking Prev/Next keeps showing the previous page's rows.
  useEffect(() => {
    setInvoices(initial);
    setCount(initialCount);
  }, [initial, initialCount]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  function updateInvoice(updated: InvoiceListItem) {
    setInvoices((prev) => prev.map((i) => i.short_code === updated.short_code ? updated : i));
  }

  async function handleDelete(invoice: InvoiceListItem) {
    const ok = await confirm({
      title: `Delete invoice ${invoice.short_code}?`,
      message: "This removes the invoice record permanently. The underlying sale or order is not affected.",
      confirmLabel: "Delete",
      variant: "danger",
    });
    if (!ok) return;
    setDeletingCode(invoice.short_code);
    try {
      await deleteInvoiceAction(invoice.short_code);
      const remaining = invoices.filter((i) => i.short_code !== invoice.short_code);
      setInvoices(remaining);
      setCount((c) => Math.max(0, c - 1));
      // Deleting the last row on a page beyond the first would otherwise
      // strand the admin on an empty page with a stale "Page N of M".
      if (remaining.length === 0 && page > 1) {
        router.push(`${pathname}?page=${page - 1}`);
      }
    } catch {
      // leave the row in place on failure
    } finally {
      setDeletingCode(null);
    }
  }

  function shareUrl(invoice: InvoiceListItem) {
    const label = invoice.customer_name ? `Hi ${invoice.customer_name}, ` : "Hi, ";
    const message = `${label}here's your invoice from Nivo (${fmtPrice(invoice.total_amount)}): ${absolutePdfUrl(invoice.short_code)}`;
    const text = encodeURIComponent(message);
    // wa.me requires a number to reliably deep-link; api.whatsapp.com/send
    // is WhatsApp's documented "compose, let the user pick a recipient"
    // endpoint for when there's no phone on file.
    const phone = normalizePhoneForWhatsApp(invoice.customer_phone);
    return phone ? `https://wa.me/${phone}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
  }

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-500 uppercase mb-1">Billing</p>
        <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Invoices</h1>
        <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">{count} invoice{count !== 1 ? "s" : ""} total</p>
      </div>

      {/* Table */}
      {invoices.length === 0 ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl py-16 text-center text-zinc-500 dark:text-zinc-600 text-sm">
          No invoices yet.
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  {["Invoice", "Source", "Customer", "Total", "Status", "Date", ""].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest py-3 px-4 first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.short_code} className="border-b border-zinc-200/70 dark:border-zinc-800/50 last:border-b-0 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 pl-5 font-mono text-[11px] font-bold text-zinc-900 dark:text-white">
                      {invoice.short_code}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        invoice.sale ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      }`}>
                        {invoice.sale ? "Sale" : "Order"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {invoice.customer_name ? (
                        <>
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium">{invoice.customer_name}</span>
                          {invoice.customer_phone && <span className="text-zinc-600 dark:text-zinc-500"> · {invoice.customer_phone}</span>}
                        </>
                      ) : (
                        <span className="text-zinc-500 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">
                      {fmtPrice(invoice.total_amount)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusSelect invoice={invoice} onChanged={updateInvoice} />
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-500 text-xs whitespace-nowrap">
                      {fmtDate(invoice.created_at)}
                    </td>
                    <td className="py-3 px-4 pr-5">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={pdfPath(invoice.short_code)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View PDF"
                          className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <FileText size={14} />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            // window.open's 3rd argument is a windowFeatures
                            // string (e.g. "width=600"), not rel tokens —
                            // passing "noopener,noreferrer" there is invalid
                            // and silently no-ops the call in some browsers.
                            // Null the opener manually on the returned handle
                            // instead, same effect as rel="noopener".
                            const tab = window.open(shareUrl(invoice), "_blank");
                            if (tab) tab.opener = null;
                          }}
                          title="Share via WhatsApp"
                          className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-500/10 transition-colors"
                        >
                          <MessageCircle size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice)}
                          disabled={deletingCode === invoice.short_code}
                          title="Delete invoice"
                          className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          {deletingCode === invoice.short_code ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pager */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-500 dark:text-zinc-600 uppercase tracking-widest font-bold">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <Link
                href={`${pathname}?page=${Math.max(1, page - 1)}`}
                aria-disabled={page <= 1}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  page <= 1
                    ? "text-zinc-400 dark:text-zinc-700 pointer-events-none"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <ChevronLeft size={13} /> Prev
              </Link>
              <Link
                href={`${pathname}?page=${Math.min(totalPages, page + 1)}`}
                aria-disabled={page >= totalPages}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  page >= totalPages
                    ? "text-zinc-400 dark:text-zinc-700 pointer-events-none"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                Next <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
