import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  change: number;
  prefix?: string;
  icon: React.ReactNode;
}

export default function StatCard({ label, value, change, prefix = "", icon }: StatCardProps) {
  const positive = change >= 0;
  const formatted =
    prefix === "UGX"
      ? `UGX ${value.toLocaleString("en-UG")}`
      : value.toLocaleString();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{label}</p>
        <span className="text-zinc-600">{icon}</span>
      </div>
      <div>
        <p className="text-3xl font-black text-white tracking-tight">{formatted}</p>
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${positive ? "text-green-400" : "text-red-400"}`}>
          {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{positive ? "+" : ""}{change}% vs last month</span>
        </div>
      </div>
    </div>
  );
}
