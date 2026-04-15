import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
} from "lucide-react";
import { kpiStats } from "@/data/admin";
import StatCard from "@/components/admin/StatCard";
import SalesChart from "@/components/admin/SalesChart";
import OrderStatusChart from "@/components/admin/OrderStatusChart";
import RecentOrders from "@/components/admin/RecentOrders";
import TopProducts from "@/components/admin/TopProducts";

const statIcons = [
  <DollarSign key="rev" size={18} />,
  <ShoppingBag key="ord" size={18} />,
  <Users key="cus" size={18} />,
  <TrendingUp key="avg" size={18} />,
];

export default function AdminDashboard() {
  const stats = Object.values(kpiStats);

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
      {/* Page header */}
      <div className="mb-7">
        <h1 className="text-xl font-black text-white uppercase tracking-tight">Dashboard</h1>
        <p className="text-xs text-zinc-500 mt-1">Apr 15, 2026 — All figures in UGX</p>
      </div>

      {/* KPI cards — 2 col mobile, 4 col desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {stats.map((stat, i) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            prefix={stat.prefix}
            icon={statIcons[i]}
          />
        ))}
      </div>

      {/* Charts row — stacked mobile, side-by-side desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <SalesChart />
        </div>
        <div className="lg:col-span-1">
          <OrderStatusChart />
        </div>
      </div>

      {/* Tables row — stacked mobile, side-by-side desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <RecentOrders />
        </div>
        <div className="xl:col-span-1">
          <TopProducts />
        </div>
      </div>
    </main>
  );
}
