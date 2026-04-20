"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/api";

interface Props {
  product: Product;
}

export default function StoreProductCard({ product }: Props) {
  const price = product.starting_price
    ? `UGX ${parseFloat(product.starting_price).toLocaleString("en-UG")}`
    : null;

  return (
    <Link href={`/products/${product.slug}`} className="group cursor-pointer block">
      {/* Image */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-zinc-100 mb-3">
        {product.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.cover_image_url}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-zinc-200 flex items-center justify-center">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No image</span>
          </div>
        )}

        {!product.in_stock && (
          <span className="absolute top-2 left-2 text-[10px] font-black tracking-widest px-2 py-1 bg-zinc-800 text-white">
            SOLD OUT
          </span>
        )}

        <button
          aria-label={`Add ${product.name} to cart`}
          className="absolute bottom-0 left-0 right-0 z-20 bg-black text-white text-xs font-bold tracking-widest uppercase py-4 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 invisible group-hover:visible transition-all duration-300 ease-in-out hover:bg-zinc-800"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/products/${product.slug}`;
          }}
        >
          <ShoppingBag size={14} />
          Quick View
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest">
          {product.category?.name ?? ""}
        </p>
        <h3 className="text-sm font-semibold text-zinc-900 leading-snug">{product.name}</h3>
        <div className="mt-1">
          {price ? (
            <span className="text-sm font-bold text-zinc-900">From {price}</span>
          ) : (
            <span className="text-xs text-zinc-400">No variants yet</span>
          )}
        </div>
      </div>
    </Link>
  );
}
