import { recentOrders } from "@/data/admin";

const statusStyles: Record<string, string> = {
  Delivered:  "bg-green-500/10 text-green-400",
  Shipped:    "bg-blue-500/10 text-blue-400",
  Processing: "bg-amber-500/10 text-amber-400",
  Pending:    "bg-zinc-500/10 text-zinc-400",
  Cancelled:  "bg-red-500/10 text-red-400",
};

const paymentStyles: Record<string, string> = {
  Paid:     "text-green-400",
  Unpaid:   "text-amber-400",
  Refunded: "text-red-400",
};

export default function RecentOrders() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Recent Orders</h3>
        <a href="#" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">
          View All
        </a>
      </div>

      {/* Scrollable table — key for mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {["Order", "Customer", "Items", "Total", "Payment", "Status", "Date"].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-5 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order, i) => (
              <tr
                key={order.id}
                className={`border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors ${
                  i === recentOrders.length - 1 ? "border-b-0" : ""
                }`}
              >
                <td className="px-5 py-3.5 font-mono text-xs font-bold text-white">{order.id}</td>
                <td className="px-5 py-3.5">
                  <p className="text-xs font-semibold text-white leading-none">{order.customer}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{order.email}</p>
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-400">{order.items}</td>
                <td className="px-5 py-3.5 text-xs font-bold text-white">UGX {order.total.toLocaleString("en-UG")}</td>
                <td className={`px-5 py-3.5 text-xs font-semibold ${paymentStyles[order.payment]}`}>
                  {order.payment}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusStyles[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
