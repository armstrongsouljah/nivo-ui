import Image from "next/image";
import { topProducts } from "@/data/admin";

export default function TopProducts() {
  const maxSold = Math.max(...topProducts.map((p) => p.sold));

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Top Products</h3>
        <a href="#" className="text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest">
          View All
        </a>
      </div>

      <ul className="divide-y divide-zinc-800/50">
        {topProducts.map((product, i) => (
          <li key={product.id} className="flex items-center gap-4 px-5 py-4">
            {/* Rank */}
            <span className="text-xs font-black text-zinc-600 w-4 shrink-0">{i + 1}</span>

            {/* Image */}
            <div className="relative w-10 h-10 rounded-md overflow-hidden bg-zinc-800 shrink-0">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>

            {/* Name + bar */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{product.name}</p>
              <p className="text-[10px] text-zinc-500 mb-1.5">{product.category}</p>
              {/* Mini progress bar */}
              <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${(product.sold / maxSold) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-white">{product.sold} sold</p>
              <p className="text-[10px] text-zinc-500">UGX {product.revenue.toLocaleString("en-UG")}</p>
              <p className={`text-[10px] font-semibold mt-0.5 ${product.stock <= 10 ? "text-red-400" : "text-zinc-500"}`}>
                {product.stock <= 10 ? `⚠ ${product.stock} left` : `${product.stock} in stock`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
