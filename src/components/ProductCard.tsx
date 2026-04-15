import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { name, price, originalPrice, tag, image, category } = product;

  return (
    <div className="group cursor-pointer">
      {/* Image container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-100 mb-3">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        />

        {/* Tag badge */}
        {tag && (
          <span
            className={`absolute top-2 left-2 text-[10px] font-black tracking-widest px-2 py-1 ${
              tag === "SALE"
                ? "bg-red-600 text-white"
                : "bg-black text-white"
            }`}
          >
            {tag}
          </span>
        )}

        {/* Quick add button — shows on hover (desktop) / always visible tap area (mobile) */}
        <button
          aria-label={`Add ${name} to cart`}
          className="absolute bottom-0 left-0 right-0 bg-black text-white text-xs font-bold tracking-widest uppercase py-3 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          <ShoppingBag size={14} />
          Quick Add
        </button>
      </div>

      {/* Info */}
      <div>
        <p className="text-[11px] text-zinc-400 uppercase tracking-widest mb-0.5">{category}</p>
        <h3 className="text-sm font-semibold text-zinc-900 leading-snug mb-1">{name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-zinc-900">${price}</span>
          {originalPrice && (
            <span className="text-xs text-zinc-400 line-through">${originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );
}
