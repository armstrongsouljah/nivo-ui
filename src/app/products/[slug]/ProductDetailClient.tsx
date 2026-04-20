"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { ProductDetail, ProductVariantDetail } from "@/lib/api";
import ProductImageViewer from "@/components/ProductImageViewer";

const AGE_LABEL: Record<string, string> = {
  "0_3m":  "0 – 3 Months",
  "3_6m":  "3 – 6 Months",
  "6_9m":  "6 – 9 Months",
  "9_12m": "9 – 12 Months",
  "12_18m":"12 – 18 Months",
  "18_24m":"18 – 24 Months",
  "3y":    "3 Years",
  "4y":    "4 Years",
  "5y":    "5 Years",
  "6y":    "6 Years",
  "7y":    "7 Years",
  "8y":    "8 Years",
};

function fmtPrice(price: string) {
  return `UGX ${parseFloat(price).toLocaleString("en-UG")}`;
}

export default function ProductDetailClient({ product }: { product: ProductDetail }) {
  const activeVariants = product.variants.filter((v) => v.is_active);

  const [selected, setSelected] = useState<ProductVariantDetail | null>(
    activeVariants.length === 1 ? activeVariants[0] : null
  );
  const [added, setAdded] = useState(false);

  // Gather all images: cover first, then gallery
  const images = [
    ...(product.cover_image_url ? [product.cover_image_url] : []),
    ...product.gallery.map((g) => g.url),
  ];

  function handleAddToCart() {
    if (!selected) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
    // TODO: dispatch to cart store
  }

  // Price display
  const prices = activeVariants.map((v) => parseFloat(v.price)).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : null;
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const priceDisplay = selected
    ? fmtPrice(selected.price)
    : minPrice === null
      ? "—"
      : minPrice === maxPrice
        ? fmtPrice(String(minPrice))
        : `${fmtPrice(String(minPrice))} – ${fmtPrice(String(maxPrice))}`;

  const inStock = selected ? selected.stock_quantity > 0 : product.in_stock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left — image viewer */}
        <ProductImageViewer images={images} productName={product.name} />

        {/* Right — product info */}
        <div className="flex flex-col">
          {/* Breadcrumb */}
          {product.category && (
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
              {product.category.name}
            </p>
          )}

          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 uppercase tracking-tight leading-tight mb-3">
            {product.name}
          </h1>

          {/* Price */}
          <p className="text-xl font-bold text-zinc-900 mb-6">
            {selected && !selected.compare_at_price && priceDisplay}
            {selected && selected.compare_at_price && (
              <span className="flex items-center gap-3">
                <span>{priceDisplay}</span>
                <span className="text-sm font-semibold text-zinc-400 line-through">
                  {fmtPrice(selected.compare_at_price)}
                </span>
                <span className="text-xs font-black bg-red-600 text-white px-2 py-0.5">SALE</span>
              </span>
            )}
            {!selected && priceDisplay}
          </p>

          {/* Variant selector */}
          {activeVariants.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
                Age Group
                {selected && (
                  <span className="ml-2 text-zinc-900 normal-case font-semibold tracking-normal">
                    — {AGE_LABEL[selected.age_group] ?? selected.age_group}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {activeVariants.map((v) => {
                  const soldOut  = v.stock_quantity === 0;
                  const isSelected = selected?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelected(isSelected ? null : v)}
                      disabled={soldOut}
                      className={`relative px-4 py-2 text-sm font-semibold border-2 transition-colors rounded
                        ${isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : soldOut
                            ? "border-zinc-200 text-zinc-300 cursor-not-allowed"
                            : "border-zinc-300 text-zinc-700 hover:border-zinc-900"
                        }`}
                    >
                      {AGE_LABEL[v.age_group] ?? v.age_group}
                      {soldOut && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="w-full h-px bg-zinc-300 rotate-[-20deg] absolute" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {activeVariants.length === 0 && (
                <p className="text-sm text-zinc-400">No sizes available.</p>
              )}
            </div>
          )}

          {/* Stock status */}
          <p className={`text-xs font-bold uppercase tracking-widest mb-5 ${inStock ? "text-green-600" : "text-red-500"}`}>
            {inStock ? "In Stock" : "Out of Stock"}
          </p>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selected || !inStock || added}
            className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-colors rounded
              ${added
                ? "bg-green-600 text-white"
                : !selected
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  : !inStock
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                    : "bg-zinc-900 text-white hover:bg-zinc-700"
              }`}
          >
            {added ? (
              <><Check size={16} /> Added to Cart</>
            ) : (
              <><ShoppingBag size={16} /> {selected ? "Add to Cart" : "Select a Size"}</>
            )}
          </button>

          {/* Description */}
          {product.description && (
            <div className="mt-8 pt-8 border-t border-zinc-100">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Description</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
