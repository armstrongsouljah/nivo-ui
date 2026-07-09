"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, ShoppingBag, DollarSign, MapPin, Package, CheckCircle, Receipt } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  period_days: number;
  totals:      { revenue: number; order_revenue: number; sales_revenue: number; orders: number; avg_order: number };
  trend:       { date: string; revenue: number; orders: number }[];
  top_products: { label: string; revenue: number; quantity: number }[];
  top_cities:  { city: string; orders: number }[];
  fulfillment: {
    total: number; delivered: number; in_progress: number;
    pending: number; cancelled: number; rate: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtUGX(n: number) {
  return `UGX ${n.toLocaleString("en-UG")}`;
}

// ─── Period tabs ──────────────────────────────────────────────────────────────

const PERIODS = [
  { label: "7 days",  value: 7  },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

function PeriodTabs({ current }: { current: number }) {
  const pathname = usePathname();
  return (
    <div className="flex gap-1.5">
      {PERIODS.map((p) => (
        <Link
          key={p.value}
          href={`${pathname}?period=${p.value}`}
          className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors ${
            current === p.value
              ? "bg-white text-black"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white"
          }`}
        >
          {p.label}
        </Link>
      ))}
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KPI({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        <span className="text-zinc-600">{icon}</span>
      </div>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
    </div>
  );
}

// ─── Revenue trend bar chart ──────────────────────────────────────────────────

function TrendChart({ trend }: { trend: AnalyticsData["trend"] }) {
  const max = trend.length ? Math.max(...trend.map((d) => d.revenue), 1) : 1;
  const step = Math.max(1, Math.floor(trend.length / 8));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6">
      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-5">Revenue Trend</h3>
      {trend.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-xs text-zinc-600">No data for this period.</div>
      ) : (
        <>
          <div className="flex items-end gap-0.5 h-40">
            {trend.map((d, i) => {
              const heightPct = Math.round((d.revenue / max) * 100);
              const isLast    = i === trend.length - 1;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className={`w-full rounded-t transition-colors ${isLast ? "bg-white" : "bg-zinc-700 group-hover:bg-zinc-500"}`}
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                  />
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-zinc-800 border border-zinc-700 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <p>{d.date}</p>
                    <p>{fmtUGX(d.revenue)}</p>
                    <p className="text-zinc-400">{d.orders} order{d.orders !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* X-axis labels — show every nth label to avoid crowding */}
          <div className="flex gap-0.5 mt-1.5">
            {trend.map((d, i) => (
              <div key={d.date} className="flex-1 text-center">
                {i % step === 0 && (
                  <span className="text-[9px] text-zinc-600">{d.date}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Fulfillment ring ─────────────────────────────────────────────────────────

function FulfillmentCard({ f }: { f: AnalyticsData["fulfillment"] }) {
  const segments = [
    { label: "Delivered",   count: f.delivered,   color: "#22c55e" },
    { label: "In Progress", count: f.in_progress, color: "#6366f1" },
    { label: "Pending",     count: f.pending,      color: "#a1a1aa" },
    { label: "Cancelled",   count: f.cancelled,    color: "#ef4444" },
  ].filter((s) => s.count > 0);

  const total = f.total || 1;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6">
      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Fulfillment</h3>

      <div className="flex items-center gap-4 mb-5">
        <div className="text-center">
          <p className="text-3xl font-black text-white">{f.rate}%</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Delivery rate</p>
        </div>
        <div className="flex-1 flex h-3 rounded-full overflow-hidden gap-px">
          {segments.map((s) => (
            <div
              key={s.label}
              style={{ width: `${(s.count / total) * 100}%`, backgroundColor: s.color }}
              title={`${s.label}: ${s.count}`}
            />
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-zinc-400">{s.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-white">{s.count}</span>
              <span className="text-zinc-600 w-8 text-right">{Math.round((s.count / total) * 100)}%</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between text-xs">
        <span className="text-zinc-500">Total orders</span>
        <span className="font-bold text-white">{f.total}</span>
      </div>
    </div>
  );
}

// ─── Top products table ───────────────────────────────────────────────────────

function TopProductsTable({ products }: { products: AnalyticsData["top_products"] }) {
  const maxRev = products[0]?.revenue || 1;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6">
      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
        Top Products
      </h3>
      {products.length === 0 ? (
        <p className="text-xs text-zinc-600 py-4 text-center">No data.</p>
      ) : (
        <ul className="space-y-3">
          {products.map((p, i) => (
            <li key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-300 font-medium truncate pr-4 flex-1">{p.label}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-zinc-500">{p.quantity} sold</span>
                  <span className="text-xs font-bold text-white">{fmtUGX(p.revenue)}</span>
                </div>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/60 rounded-full"
                  style={{ width: `${(p.revenue / maxRev) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Top cities table ─────────────────────────────────────────────────────────

function TopCitiesTable({ cities }: { cities: AnalyticsData["top_cities"] }) {
  const maxOrders = cities[0]?.orders || 1;
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6">
      <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
        Orders by City
      </h3>
      {cities.length === 0 ? (
        <p className="text-xs text-zinc-600 py-4 text-center">No data.</p>
      ) : (
        <ul className="space-y-3">
          {cities.map((c, i) => (
            <li key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-300 font-medium">{c.city}</span>
                <span className="text-xs font-bold text-white">{c.orders}</span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500/60 rounded-full"
                  style={{ width: `${(c.orders / maxOrders) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AnalyticsClient({
  data,
  period,
}: {
  data: AnalyticsData | null;
  period: number;
}) {
  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-1">Reports</p>
          <h1 className="text-xl font-black text-white uppercase tracking-tight">Analytics</h1>
        </div>
        <PeriodTabs current={period} />
      </div>

      {!data ? (
        <div className="text-xs text-zinc-600 text-center py-20">Failed to load analytics data.</div>
      ) : (
        <div className="space-y-4">

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI label="Revenue"         value={fmtUGX(data.totals.revenue)}       icon={<DollarSign size={16} />} />
            <KPI label="Orders"          value={String(data.totals.orders)}        icon={<ShoppingBag size={16} />} />
            <KPI label="POS Sales"       value={fmtUGX(data.totals.sales_revenue)} icon={<Receipt size={16} />} />
            <KPI label="Avg Order Value" value={fmtUGX(data.totals.avg_order)}     icon={<TrendingUp size={16} />} />
          </div>

          {/* Trend chart — full width */}
          <TrendChart trend={data.trend} />

          {/* Middle row: fulfillment + cities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FulfillmentCard f={data.fulfillment} />
            <TopCitiesTable  cities={data.top_cities} />
          </div>

          {/* Bottom: top products — full width */}
          <TopProductsTable products={data.top_products} />
        </div>
      )}
    </main>
  );
}
