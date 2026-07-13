import CopyCode from "./CopyCode";

export const metadata = { title: "Gift Voucher — Nivo" };

// Public page — reachable by anyone with the link (shared via WhatsApp,
// QR scan, etc.), no admin session required. Fetches straight from the
// backend's public GET /vouchers/{short_code}/ rather than going through
// server-api.ts, which always attaches an admin auth header.
const BASE_URL = (process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

interface VoucherPublicDetail {
  short_code:     string;
  voucher_type:   "discount" | "spend";
  status:         "active" | "used" | "cancelled";
  amount:         string;
  is_paid:        boolean;
  recipient_name: string;
  expires_at:     string | null;
  is_expired:     boolean;
  used_at:        string | null;
}

async function getVoucher(shortCode: string): Promise<VoucherPublicDetail | null> {
  const res = await fetch(`${BASE_URL}/vouchers/${shortCode}/`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

function fmtPrice(v: string) {
  return `UGX ${parseFloat(v).toLocaleString("en-UG")}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric" });
}

export default async function VoucherPage({ params }: { params: Promise<{ shortCode: string }> }) {
  const { shortCode } = await params;
  const voucher = await getVoucher(shortCode);

  if (!voucher) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-white font-black text-2xl tracking-widest uppercase mb-2">Nivo</p>
          <p className="text-zinc-400 text-sm">Voucher not found.</p>
        </div>
      </div>
    );
  }

  const isExpired = voucher.status === "active" && voucher.is_expired;
  const displayStatus = isExpired ? "Expired" : voucher.status;

  const STATUS_STYLES: Record<string, string> = {
    active:    "bg-green-100 text-green-700",
    used:      "bg-zinc-200 text-zinc-600",
    cancelled: "bg-red-100 text-red-700",
    Expired:   "bg-amber-100 text-amber-700",
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-6">
          <p className="text-white font-black text-2xl tracking-widest uppercase">Nivo</p>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
            {voucher.voucher_type === "discount" ? "Discount Voucher" : "Gift Voucher"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="p-6 text-center border-b border-dashed border-zinc-200">
            <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4 ${STATUS_STYLES[displayStatus]}`}>
              {displayStatus}
            </span>

            <p className="text-3xl font-black text-zinc-900 mb-1">{fmtPrice(voucher.amount)}</p>
            {voucher.recipient_name && (
              <p className="text-xs text-zinc-500">Issued to {voucher.recipient_name}</p>
            )}

            <div className="my-6">
              {/* eslint-disable-next-line @next/next/no-img-element -- backend-proxied dynamic PNG, not an optimizable static asset */}
              <img
                src={`/vouchers/${voucher.short_code}/qr`}
                alt={`QR code for voucher ${voucher.short_code}`}
                className="mx-auto w-44 h-44"
              />
            </div>

            <CopyCode code={voucher.short_code} />
          </div>

          <div className="p-5 text-center">
            {voucher.status === "used" && voucher.used_at ? (
              <p className="text-xs text-zinc-500">Redeemed on {fmtDate(voucher.used_at)}</p>
            ) : voucher.status === "cancelled" ? (
              <p className="text-xs text-zinc-500">This voucher has been cancelled and can no longer be redeemed.</p>
            ) : isExpired ? (
              <>
                <p className="text-xs text-zinc-500">This voucher has expired and can no longer be redeemed.</p>
                {voucher.expires_at && (
                  <p className="text-[11px] text-zinc-400 mt-1.5">Expired {fmtDate(voucher.expires_at)}</p>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-zinc-500">
                  Show this QR code or code to staff in-store to redeem.
                </p>
                {voucher.expires_at && (
                  <p className="text-[11px] text-zinc-400 mt-1.5">Valid until {fmtDate(voucher.expires_at)}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
