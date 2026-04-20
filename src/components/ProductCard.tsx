"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { name, price, originalPrice, tag, image, category } = product;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevents the click from bubbling up to the card if the card is a Link
    e.preventDefault();
    e.stopPropagation();
    
    // Add your cart logic here (e.g., dispatching to a store or calling an API)
    console.log(`Added ${name} to cart`);
  };

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
            className={`absolute top-2 left-2 text-[10px] font-black tracking-widest px-2 py-1 z-10 ${
              tag === "SALE"
                ? "bg-red-600 text-white"
                : "bg-black text-white"
            }`}
          >
            {tag}
          </span>
        )}

        {/* Quick add button */}
        <button
          onClick={handleAddToCart}
          aria-label={`Add ${name} to cart`}
          /* FIXED: Added 'invisible group-hover:visible' for accessibility.
             Without this, keyboard users would tab onto a hidden button.
          */
          className="absolute bottom-0 left-0 right-0 z-20 bg-black text-white text-xs font-bold tracking-widest uppercase py-4 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 invisible group-hover:visible transition-all duration-300 ease-in-out hover:bg-zinc-800"
        >
          <ShoppingBag size={14} />
          Quick Add
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest">
          {category}
        </p>
        <h3 className="text-sm font-semibold text-zinc-900 leading-snug">
          {name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          {/* FIXED: Using toFixed(2) for consistent currency display */}
          <span className="text-sm font-bold text-zinc-900">
            ${price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-xs text-zinc-400 line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}