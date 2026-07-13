"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Ban, RefreshCw, Check, X, Plus, Share2, QrCode } from "lucide-react";
import type { VoucherListItem, VoucherStatus, VoucherType, VoucherCreatePayload } from "@/lib/api";
import { adjustVoucherAmountAction, revokeVoucherAction, renewVoucherAction, createVoucherAction, getVoucherAction } from "./actions";
import { useConfirm } from "@/components/admin/ConfirmDialog";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(v: string) {
  return `UGX ${parseFloat(v).toLocaleString("en-UG")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });
}

function fmtExpiry(iso: string | null, isExpired: boolean): string | null {
  if (!iso) return null;
  return `${isExpired ? "Expired" : "Expires"} ${fmtDate(iso)}`;
}

// Public proxy route (src/app/vouchers/[shortCode]/qr/route.ts) — keeps the
// shared link on our own domain instead of exposing the backend API host.
function qrPath(shortCode: string) {
  return `/vouchers/${shortCode}/qr`;
}

// Public, nicely-branded voucher view (src/app/vouchers/[shortCode]/page.tsx)
// — what recipients actually see when they open a shared link.
function voucherPagePath(shortCode: string) {
  return `/vouchers/${shortCode}`;
}

function absoluteVoucherPageUrl(shortCode: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${voucherPagePath(shortCode)}`;
}

// Local Ugandan numbers are stored as "0XXXXXXXXX"; wa.me needs the full
// international form with no leading zero (e.g. "2567XXXXXXXX").
function normalizePhoneForWhatsApp(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("256")) return digits;
  if (digits.startsWith("0")) return `256${digits.slice(1)}`;
  return digits;
}

function voucherShareUrl(voucher: { short_code: string; amount: string; recipient_name: string; recipient_phone?: string }) {
  const label = voucher.recipient_name ? `Hi ${voucher.recipient_name}, ` : "Hi, ";
  const message = `${label}here's your Nivo gift voucher worth ${fmtPrice(voucher.amount)}. View it here: ${absoluteVoucherPageUrl(voucher.short_code)}`;
  const text = encodeURIComponent(message);
  const phone = normalizePhoneForWhatsApp(voucher.recipient_phone ?? "");
  return phone ? `https://wa.me/${phone}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
}

const STATUS_STYLES: Record<VoucherStatus, string> = {
  active:    "bg-green-500/10 text-green-600 dark:text-green-400",
  used:      "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const EXPIRED_STYLE = "bg-amber-500/10 text-amber-600 dark:text-amber-400";

const STATUS_TABS: { label: string; value: VoucherStatus | undefined }[] = [
  { label: "All",       value: undefined },
  { label: "Active",    value: "active" },
  { label: "Used",      value: "used" },
  { label: "Cancelled", value: "cancelled" },
];

// ─── Inline adjust-amount form ───────────────────────────────────────────────

function AdjustAmountForm({
  voucher,
  onSaved,
  onCancel,
}: {
  voucher: VoucherListItem;
  onSaved: (updated: VoucherListItem) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(voucher.amount);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleSave() {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) { setError("Enter an amount greater than zero."); return; }
    setBusy(true); setError(null);
    try {
      const updated = await adjustVoucherAmountAction(voucher.short_code, value.toFixed(2));
      onSaved({ ...voucher, amount: updated.amount });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to adjust amount.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="number"
        step="0.01"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        className="w-28 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs px-2 py-1.5 rounded-md focus:outline-none focus:border-zinc-500"
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

// ─── Inline renew form ───────────────────────────────────────────────────────

function RenewForm({
  voucher,
  onSaved,
  onCancel,
}: {
  voucher: VoucherListItem;
  onSaved: (updated: VoucherListItem) => void;
  onCancel: () => void;
}) {
  const [days, setDays] = useState("30");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const value = parseInt(days, 10);
    if (isNaN(value) || value <= 0) { setError("Enter a number of days greater than zero."); return; }
    setBusy(true); setError(null);
    try {
      const updated = await renewVoucherAction(voucher.short_code, value);
      onSaved({ ...voucher, expires_at: updated.expires_at, is_expired: updated.is_expired });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to renew voucher.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-zinc-600 dark:text-zinc-400">Extend by</span>
      <input
        type="number"
        step="1"
        min="1"
        value={days}
        onChange={(e) => setDays(e.target.value)}
        placeholder="Days"
        className="w-20 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs px-2 py-1.5 rounded-md focus:outline-none focus:border-zinc-500"
      />
      <span className="text-xs text-zinc-600 dark:text-zinc-400">days</span>
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

// ─── Create voucher modal ────────────────────────────────────────────────────

function CreateVoucherModal({
  onCreated,
  onClose,
}: {
  onCreated: (voucher: VoucherListItem & { recipient_phone: string }) => void;
  onClose: () => void;
}) {
  const [voucherType, setVoucherType] = useState<VoucherType>("spend");
  const [amount, setAmount] = useState("");
  const [isPaid, setIsPaid] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) { setError("Enter an amount greater than zero."); return; }
    setBusy(true); setError(null);
    const payload: VoucherCreatePayload = {
      voucher_type: voucherType,
      amount: value.toFixed(2),
      is_paid: isPaid,
      recipient_name: recipientName || undefined,
      recipient_phone: recipientPhone || undefined,
      recipient_email: recipientEmail || undefined,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    };
    try {
      const created = await createVoucherAction(payload);
      onCreated({ ...created, recipient_phone: created.recipient_phone });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to issue voucher.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-auto"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 mx-4 max-h-[85vh] overflow-y-auto"
        >
          <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wide mb-4">Issue Voucher</h2>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs">
                <span className="block text-zinc-600 dark:text-zinc-400 mb-1">Type</span>
                <select
                  value={voucherType}
                  onChange={(e) => setVoucherType(e.target.value as VoucherType)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs px-2 py-2 rounded-md focus:outline-none focus:border-zinc-500"
                >
                  <option value="spend">Spend</option>
                  <option value="discount">Discount</option>
                </select>
              </label>
              <label className="text-xs">
                <span className="block text-zinc-600 dark:text-zinc-400 mb-1">Amount</span>
                <input
                  type="number" step="0.01" min="0" required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs px-2 py-2 rounded-md focus:outline-none focus:border-zinc-500"
                />
              </label>
            </div>

            <label className="text-xs block">
              <span className="block text-zinc-600 dark:text-zinc-400 mb-1">Recipient name</span>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs px-2 py-2 rounded-md focus:outline-none focus:border-zinc-500"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-xs">
                <span className="block text-zinc-600 dark:text-zinc-400 mb-1">Phone</span>
                <input
                  type="tel"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="For WhatsApp delivery"
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs px-2 py-2 rounded-md focus:outline-none focus:border-zinc-500"
                />
              </label>
              <label className="text-xs">
                <span className="block text-zinc-600 dark:text-zinc-400 mb-1">Email</span>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs px-2 py-2 rounded-md focus:outline-none focus:border-zinc-500"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <label className="text-xs">
                <span className="block text-zinc-600 dark:text-zinc-400 mb-1">Expires (optional)</span>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs px-2 py-2 rounded-md focus:outline-none focus:border-zinc-500"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 pb-2">
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  className="rounded"
                />
                Already paid
              </label>
            </div>
          </div>

          {error && <p className="text-[11px] text-red-600 dark:text-red-400 mt-3">{error}</p>}

          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors uppercase tracking-widest bg-blue-500 text-white dark:bg-white dark:text-black hover:bg-blue-600 dark:hover:bg-zinc-200 disabled:opacity-50"
            >
              {busy && <Loader2 size={12} className="animate-spin" />} Issue Voucher
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

// ─── Share voucher modal ─────────────────────────────────────────────────────

function ShareModal({ shortCode, onClose }: { shortCode: string; onClose: () => void }) {
  const [voucher, setVoucher] = useState<{ amount: string; recipient_name: string; recipient_phone: string } | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    let cancelled = false;
    getVoucherAction(shortCode).then((detail) => {
      if (!cancelled) setVoucher(detail);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [shortCode]);

  function handleCopy() {
    navigator.clipboard.writeText(shortCode)
      .then(() => setCopyStatus("copied"))
      .catch(() => setCopyStatus("failed"))
      .finally(() => setTimeout(() => setCopyStatus("idle"), 1500));
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs mx-auto"
      >
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 mx-4 text-center">
          <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wide mb-4">Voucher Issued</h2>

          {/* eslint-disable-next-line @next/next/no-img-element -- backend-proxied dynamic PNG, not an optimizable static asset */}
          <img
            src={qrPath(shortCode)}
            alt={`QR code for voucher ${shortCode}`}
            className="mx-auto mb-3 w-40 h-40 rounded-lg border border-zinc-200 dark:border-zinc-800"
          />

          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy voucher code ${shortCode}`}
            className="font-mono text-sm font-bold text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {copyStatus === "copied" ? "Copied!" : copyStatus === "failed" ? "Copy failed" : shortCode}
          </button>

          {voucher && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-3">
              {fmtPrice(voucher.amount)}{voucher.recipient_name ? ` for ${voucher.recipient_name}` : ""}
            </p>
          )}

          <div className="flex gap-2 justify-center mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors uppercase tracking-widest"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                const url = voucher
                  ? voucherShareUrl({ short_code: shortCode, ...voucher })
                  : voucherShareUrl({ short_code: shortCode, amount: "0", recipient_name: "" });
                const tab = window.open(url, "_blank");
                if (tab) tab.opener = null;
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-colors uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white"
            >
              <Share2 size={12} /> Share via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────────

export default function VouchersClient({
  initial,
  count: initialCount,
  page,
  pageSize,
  status,
}: {
  initial: VoucherListItem[];
  count: number;
  page: number;
  pageSize: number;
  status: VoucherStatus | undefined;
}) {
  const [vouchers, setVouchers] = useState<VoucherListItem[]>(initial);
  const [count, setCount] = useState(initialCount);
  const [adjustingCode, setAdjustingCode] = useState<string | null>(null);
  const [renewingCode, setRenewingCode] = useState<string | null>(null);
  const [revokingCode, setRevokingCode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sharingCode, setSharingCode] = useState<string | null>(null);
  const [revokeError, setRevokeError] = useState<{ code: string; message: string } | null>(null);
  const pathname = usePathname();
  const confirm = useConfirm();

  // `initial`/`initialCount` are fresh server-fetched props on every
  // ?page=/?status= navigation, but useState only seeds from them on first
  // mount — without this, switching tabs or paging keeps showing stale rows.
  useEffect(() => {
    setVouchers(initial);
    setCount(initialCount);
  }, [initial, initialCount]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  function updateVoucher(updated: VoucherListItem) {
    setVouchers((prev) => prev.map((v) => v.short_code === updated.short_code ? updated : v));
  }

  async function handleRevoke(voucher: VoucherListItem) {
    const ok = await confirm({
      title: `Revoke voucher ${voucher.short_code}?`,
      message: "This cancels the voucher — it can no longer be redeemed.",
      confirmLabel: "Revoke",
      variant: "danger",
    });
    if (!ok) return;
    setRevokingCode(voucher.short_code);
    setRevokeError(null);
    try {
      const updated = await revokeVoucherAction(voucher.short_code);
      updateVoucher({ ...voucher, status: updated.status });
    } catch (e) {
      setRevokeError({
        code: voucher.short_code,
        message: e instanceof Error ? e.message : "Failed to revoke voucher.",
      });
    } finally {
      setRevokingCode(null);
    }
  }

  function openAdjust(shortCode: string) {
    setRenewingCode(null);
    setAdjustingCode((prev) => prev === shortCode ? null : shortCode);
  }

  function openRenew(shortCode: string) {
    setAdjustingCode(null);
    setRenewingCode((prev) => prev === shortCode ? null : shortCode);
  }

  function handleCreated(voucher: VoucherListItem) {
    // New vouchers are always issued as "active" — only splice it into the
    // visible list when that matches the current filter/page, otherwise it'd
    // render under a status tab it doesn't belong to (or push the page past
    // pageSize). It still exists server-side either way.
    const matchesView = !status || status === voucher.status;
    if (matchesView) {
      setCount((c) => c + 1);
      if (page === 1) {
        setVouchers((prev) => [voucher, ...prev].slice(0, pageSize));
      }
    }
    setShowCreateModal(false);
    setSharingCode(voucher.short_code);
  }

  function statusHref(value: VoucherStatus | undefined) {
    const qs = new URLSearchParams();
    if (value) qs.set("status", value);
    const s = qs.toString();
    return s ? `${pathname}?${s}` : pathname;
  }

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 dark:text-zinc-500 uppercase mb-1">Billing</p>
          <h1 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Vouchers</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-1">{count} voucher{count !== 1 ? "s" : ""} total</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-500 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-md hover:bg-blue-600 dark:hover:bg-zinc-200 transition-colors shrink-0"
        >
          <Plus size={14} /> Issue Voucher
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5 mb-4">
        {STATUS_TABS.map((tab) => {
          const active = tab.value === status;
          return (
            <Link
              key={tab.label}
              href={statusHref(tab.value)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors ${
                active
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      {vouchers.length === 0 ? (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl py-16 text-center text-zinc-500 dark:text-zinc-600 text-sm">
          No vouchers found.
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  {["Code", "Type", "Recipient", "Amount", "Paid", "Status", "Date", ""].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold text-zinc-600 dark:text-zinc-500 uppercase tracking-widest py-3 px-4 first:pl-5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vouchers.map((voucher) => (
                  <Fragment key={voucher.short_code}>
                    <tr className="border-b border-zinc-200/70 dark:border-zinc-800/50 last:border-b-0 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 pl-5 font-mono text-[11px] font-bold text-zinc-900 dark:text-white">
                        {voucher.short_code}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          voucher.voucher_type === "discount" ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        }`}>
                          {voucher.voucher_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {voucher.recipient_name ? (
                          <span className="text-zinc-700 dark:text-zinc-300 font-medium">{voucher.recipient_name}</span>
                        ) : (
                          <span className="text-zinc-500 dark:text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-white">
                        {fmtPrice(voucher.amount)}
                      </td>
                      <td className="py-3 px-4">
                        {voucher.is_paid ? (
                          <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Paid</span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Unpaid</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          voucher.status === "active" && voucher.is_expired ? EXPIRED_STYLE : STATUS_STYLES[voucher.status]
                        }`}>
                          {voucher.status === "active" && voucher.is_expired ? "Expired" : voucher.status}
                        </span>
                        {voucher.expires_at && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-1 whitespace-nowrap">
                            {fmtExpiry(voucher.expires_at, voucher.is_expired)}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-600 dark:text-zinc-500 text-xs whitespace-nowrap">
                        {fmtDate(voucher.created_at)}
                      </td>
                      <td className="py-3 px-4 pr-5">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={voucherPagePath(voucher.short_code)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View voucher"
                            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                          >
                            <QrCode size={14} />
                          </a>
                          <button
                            type="button"
                            onClick={() => setSharingCode(voucher.short_code)}
                            title="Share via WhatsApp"
                            className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-500/10 transition-colors"
                          >
                            <Share2 size={14} />
                          </button>
                          {voucher.status === "active" && (
                            <>
                              <button
                                type="button"
                                onClick={() => openAdjust(voucher.short_code)}
                                title="Adjust amount"
                                className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              {voucher.is_expired && (
                                <button
                                  type="button"
                                  onClick={() => openRenew(voucher.short_code)}
                                  title="Renew voucher"
                                  className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                >
                                  <RefreshCw size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRevoke(voucher)}
                                disabled={revokingCode === voucher.short_code}
                                title="Revoke voucher"
                                className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              >
                                {revokingCode === voucher.short_code ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {revokeError?.code === voucher.short_code && (
                      <tr className="border-b border-zinc-200/70 dark:border-zinc-800/50 bg-red-50 dark:bg-red-500/5">
                        <td colSpan={8} className="px-5 py-2 text-[11px] text-red-600 dark:text-red-400">
                          {revokeError.message}
                        </td>
                      </tr>
                    )}
                    {adjustingCode === voucher.short_code && (
                      <tr className="border-b border-zinc-200/70 dark:border-zinc-800/50 bg-zinc-100/40 dark:bg-zinc-800/20">
                        <td colSpan={8} className="px-5 py-3">
                          <AdjustAmountForm
                            voucher={voucher}
                            onSaved={(updated) => { updateVoucher(updated); setAdjustingCode(null); }}
                            onCancel={() => setAdjustingCode(null)}
                          />
                        </td>
                      </tr>
                    )}
                    {renewingCode === voucher.short_code && (
                      <tr className="border-b border-zinc-200/70 dark:border-zinc-800/50 bg-zinc-100/40 dark:bg-zinc-800/20">
                        <td colSpan={8} className="px-5 py-3">
                          <RenewForm
                            voucher={voucher}
                            onSaved={(updated) => { updateVoucher(updated); setRenewingCode(null); }}
                            onCancel={() => setRenewingCode(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
                href={`${statusHref(status)}${status ? "&" : "?"}page=${Math.max(1, page - 1)}`}
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
                href={`${statusHref(status)}${status ? "&" : "?"}page=${Math.min(totalPages, page + 1)}`}
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

      {showCreateModal && (
        <CreateVoucherModal onCreated={handleCreated} onClose={() => setShowCreateModal(false)} />
      )}
      {sharingCode && (
        <ShareModal shortCode={sharingCode} onClose={() => setSharingCode(null)} />
      )}
    </main>
  );
}
