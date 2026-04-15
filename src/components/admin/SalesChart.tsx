import { monthlySales } from "@/data/admin";

export default function SalesChart() {
  const max = Math.max(...monthlySales.map((m) => m.revenue));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Revenue</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Last 6 months</p>
        </div>
        <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">
          +12.4% MoM
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2 sm:gap-3 h-36">
        {monthlySales.map((m, i) => {
          const isLast = i === monthlySales.length - 1;
          const heightPct = Math.round((m.revenue / max) * 100);
          return (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="relative w-full flex items-end justify-center" style={{ height: "120px" }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isLast ? "bg-white" : "bg-zinc-700 group-hover:bg-zinc-500"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-700 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  UGX {m.revenue.toLocaleString("en-UG")}
                </div>
              </div>
              <span className={`text-[11px] font-medium ${isLast ? "text-white" : "text-zinc-500"}`}>
                {m.month}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary row */}
      <div className="mt-5 pt-4 border-t border-zinc-800 grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">This Month</p>
          <p className="text-sm font-bold text-white">UGX 54,834,000</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Last Month</p>
          <p className="text-sm font-bold text-white">UGX 41,440,000</p>
        </div>
        <div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-0.5">Total Orders</p>
          <p className="text-sm font-bold text-white">348</p>
        </div>
      </div>
    </div>
  );
}
