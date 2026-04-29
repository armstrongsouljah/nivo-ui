export interface RevenueDataPoint {
  month:   string;
  revenue: number;
  orders:  number;
}

function fmtUGX(n: number) {
  return `UGX ${n.toLocaleString("en-UG")}`;
}

export default function SalesChart({ data }: { data: RevenueDataPoint[] }) {
  const max         = data.length ? Math.max(...data.map((d) => d.revenue), 1) : 1;
  const thisMonth   = data.at(-1);
  const lastMonth   = data.at(-2);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  const momChange = thisMonth && lastMonth && lastMonth.revenue > 0
    ? ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue) * 100
    : null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Revenue</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Last 6 months</p>
        </div>
        {momChange !== null && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            momChange >= 0
              ? "text-green-400 bg-green-400/10"
              : "text-red-400 bg-red-400/10"
          }`}>
            {momChange >= 0 ? "+" : ""}{momChange.toFixed(1)}% MoM
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="h-36 flex items-center justify-center text-xs text-zinc-600">
          No revenue data yet.
        </div>
      ) : (
        <div className="flex items-end gap-2 sm:gap-3 h-36">
          {data.map((d, i) => {
            const isLast    = i === data.length - 1;
            const heightPct = Math.round((d.revenue / max) * 100);
            return (
              <div key={`${d.month}-${i}`} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="relative w-full flex items-end justify-center" style={{ height: "120px" }}>
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isLast ? "bg-white" : "bg-zinc-700 group-hover:bg-zinc-500"
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-700 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {fmtUGX(d.revenue)}
                  </div>
                </div>
                <span className={`text-[11px] font-medium ${isLast ? "text-white" : "text-zinc-500"}`}>
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">This Month</p>
          <p className="text-sm font-bold text-white">{thisMonth ? fmtUGX(thisMonth.revenue) : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Last Month</p>
          <p className="text-sm font-bold text-white">{lastMonth ? fmtUGX(lastMonth.revenue) : "—"}</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Total Orders</p>
          <p className="text-sm font-bold text-white">{totalOrders}</p>
        </div>
      </div>
    </div>
  );
}
