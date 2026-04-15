import { orderStatusBreakdown } from "@/data/admin";

export default function OrderStatusChart() {
  const total = orderStatusBreakdown.reduce((s, o) => s + o.count, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6">
      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-5">Order Status</h3>

      {/* Segmented bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-5 gap-px">
        {orderStatusBreakdown.map((o) => (
          <div
            key={o.status}
            style={{ width: `${(o.count / total) * 100}%`, backgroundColor: o.color }}
            title={`${o.status}: ${o.count}`}
          />
        ))}
      </div>

      {/* Legend */}
      <ul className="space-y-2.5">
        {orderStatusBreakdown.map((o) => (
          <li key={o.status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: o.color }} />
              <span className="text-xs text-zinc-400">{o.status}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white">{o.count}</span>
              <span className="text-[10px] text-zinc-600 w-8 text-right">
                {Math.round((o.count / total) * 100)}%
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
