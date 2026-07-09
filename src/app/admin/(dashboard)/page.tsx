import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { serverApi } from "@/lib/server-api";
import StatCard from "@/components/admin/StatCard";
import SalesChart from "@/components/admin/SalesChart";
import OrderStatusChart from "@/components/admin/OrderStatusChart";
import RecentOrders from "@/components/admin/RecentOrders";
import TopProducts from "@/components/admin/TopProducts";

export default async function AdminDashboard() {
  const [recentProducts, recentOrders, orderStats, revenueData, kpi] = await Promise.all([
    serverApi.products.list({ page_size: 5 }).then((r) => r.results).catch(() => []),
    serverApi.orders.list({ page_size: 10 }).then((r) => r.results).catch(() => []),
    serverApi.orders.stats().catch(() => ({} as Record<string, number>)),
    serverApi.orders.revenue().catch(() => [] as { month: string; revenue: number; order_revenue: number; sales_revenue: number; orders: number }[]),
    serverApi.orders.kpi().catch(() => null),
  ]);

  const statCards = [
    { label: "Total Revenue",   value: kpi?.revenue.value   ?? 0, change: kpi?.revenue.change   ?? 0, prefix: "UGX", icon: <DollarSign size={18} /> },
    { label: "Total Orders",    value: kpi?.orders.value    ?? 0, change: kpi?.orders.change    ?? 0, prefix: "",    icon: <ShoppingBag size={18} /> },
    { label: "Customers",       value: kpi?.customers.value ?? 0, change: kpi?.customers.change ?? 0, prefix: "",    icon: <Users size={18} /> },
    { label: "Avg. Order Value",value: kpi?.avg_order.value ?? 0, change: kpi?.avg_order.change ?? 0, prefix: "UGX", icon: <TrendingUp size={18} /> },
  ];

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      <div className="mb-7">
        <h1 className="text-xl font-black text-white uppercase tracking-tight">Dashboard</h1>
        <p className="text-xs text-zinc-500 mt-1">All figures in UGX · this month</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            prefix={stat.prefix}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <SalesChart data={revenueData} />
        </div>
        <div className="lg:col-span-1">
          <OrderStatusChart stats={orderStats} />
        </div>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <RecentOrders orders={recentOrders} />
        </div>
        <div className="xl:col-span-1">
          <TopProducts products={recentProducts} />
        </div>
      </div>
    </main>
  );
}
