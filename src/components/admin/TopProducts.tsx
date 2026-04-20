import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { Product } from "@/lib/api";

interface Props {
  products: Product[];
}

export default function TopProducts({ products }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Products</h3>
        <Link
          href="/admin/products"
          className="text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest"
        >
          View All
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="px-5 py-8 text-xs text-zinc-600 text-center">No products yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-800/50">
          {products.map((product, i) => (
            <li key={product.id} className="flex items-center gap-4 px-5 py-4">
              {/* Rank */}
              <span className="text-xs font-black text-zinc-600 w-4 shrink-0">{i + 1}</span>

              {/* Image */}
              <div className="w-10 h-10 rounded-md bg-zinc-800 shrink-0 overflow-hidden flex items-center justify-center">
                {product.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.cover_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageOff size={13} className="text-zinc-600" />
                )}
              </div>

              {/* Name + category */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {product.category?.name ?? "Uncategorised"}
                </p>
              </div>

              {/* Status badges */}
              <div className="text-right shrink-0 space-y-1">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                  product.is_active ? "text-green-400" : "text-zinc-600"
                }`}>
                  {product.is_active ? "Active" : "Inactive"}
                </p>
                <p className={`text-[10px] font-semibold ${
                  product.in_stock ? "text-zinc-500" : "text-amber-400"
                }`}>
                  {product.in_stock ? "In stock" : "Out of stock"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
