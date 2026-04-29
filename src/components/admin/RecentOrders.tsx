import Link from "next/link";
import type { OrderSummary } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-500/10 text-amber-400",
  confirmed:  "bg-blue-500/10 text-blue-400",
  processing: "bg-purple-500/10 text-purple-400",
  shipped:    "bg-indigo-500/10 text-indigo-400",
  delivered:  "bg-green-500/10 text-green-400",
  cancelled:  "bg-red-500/10 text-red-400",
  refunded:   "bg-zinc-500/10 text-zinc-400",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-UG", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function RecentOrders({ orders }: { orders: OrderSummary[] }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recent Orders</h3>
        <Link
          href="/admin/orders"
          className="text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest"
        >
          View All
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="px-5 py-8 text-xs text-zinc-600 text-center">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {["Code", "Total", "Payment", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr
                  key={order.id}
                  className={`border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors ${i === orders.length - 1 ? "border-b-0" : ""}`}
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders/${order.id}`} className="font-black text-white tracking-widest hover:text-zinc-300 transition-colors">
                      {order.secure_code ?? order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-bold text-white">
                    UGX {parseFloat(order.total_price).toLocaleString("en-UG")}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${order.is_paid ? "text-green-400" : "text-amber-400"}`}>
                      {order.is_paid ? "Paid" : "COD"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap">
                    {fmtDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
