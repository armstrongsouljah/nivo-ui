const STATUS_CONFIG: { status: string; color: string }[] = [
  { status: "pending",    color: "#a1a1aa" },
  { status: "confirmed",  color: "#3b82f6" },
  { status: "processing", color: "#f59e0b" },
  { status: "shipped",    color: "#6366f1" },
  { status: "delivered",  color: "#22c55e" },
  { status: "cancelled",  color: "#ef4444" },
  { status: "refunded",   color: "#8b5cf6" },
];

export default function OrderStatusChart({ stats }: { stats: Record<string, number> }) {
  const rows = STATUS_CONFIG.map((s) => ({ ...s, count: stats[s.status] ?? 0 })).filter((s) => s.count > 0);
  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6">
      <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-5">Order Status</h3>

      {total === 0 ? (
        <p className="text-xs text-zinc-500 dark:text-zinc-600 text-center py-6">No orders yet.</p>
      ) : (
        <>
          {/* Segmented bar */}
          <div className="flex h-3 rounded-full overflow-hidden mb-5 gap-px">
            {rows.map((r) => (
              <div
                key={r.status}
                style={{ width: `${(r.count / total) * 100}%`, backgroundColor: r.color }}
                title={`${r.status}: ${r.count}`}
              />
            ))}
          </div>

          {/* Legend */}
          <ul className="space-y-2.5">
            {rows.map((r) => (
              <li key={r.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">{r.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">{r.count}</span>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-600 w-8 text-right">
                    {Math.round((r.count / total) * 100)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
