"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import type { ProductDetail, AgeGroupOptions, VariantOption } from "@/lib/api";
import ProductImageViewer from "@/components/ProductImageViewer";

function fmtPrice(price: string) {
  return `UGX ${parseFloat(price).toLocaleString("en-UG")}`;
}

interface ColorChoice {
  value: string;       // e.g. "black"
  display: string;     // e.g. "Black"
  hex?: string;
  inStock: boolean;
  option: VariantOption;
}

function colorsForGroup(group: AgeGroupOptions): ColorChoice[] {
  const seen = new Set<string>();
  const choices: ColorChoice[] = [];
  for (const opt of group.options) {
    const colorAttr = opt.attributes.find((a) => a.slug === "color" || a.name.toLowerCase() === "color");
    if (!colorAttr) continue;
    if (seen.has(colorAttr.value)) continue;
    seen.add(colorAttr.value);
    choices.push({
      value: colorAttr.value,
      display: colorAttr.display,
      hex: colorAttr.metadata?.color as string | undefined,
      inStock: opt.in_stock,
      option: opt,
    });
  }
  return choices;
}

function isLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

export default function ProductDetailClient({ product }: { product: ProductDetail }) {
  const groups = product.variant_options ?? [];

  const hasColors = groups.some((g) =>
    g.options.some((o) =>
      o.attributes.some((a) => a.slug === "color" || a.name.toLowerCase() === "color")
    )
  );

  const [selectedAge, setSelectedAge] = useState<string | null>(
    groups.length === 1 ? groups[0].age_group : null
  );
  const [selectedColorValue, setSelectedColorValue] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selectedGroup = groups.find((g) => g.age_group === selectedAge) ?? null;
  const colorChoices = selectedGroup ? colorsForGroup(selectedGroup) : [];

  // Resolve the exact option (variant) that matches age + color selection
  const selectedOption: VariantOption | null = (() => {
    if (!selectedGroup) return null;
    if (hasColors) {
      if (!selectedColorValue) return null;
      return selectedGroup.options.find((o) =>
        o.attributes.some(
          (a) => (a.slug === "color" || a.name.toLowerCase() === "color") && a.value === selectedColorValue
        )
      ) ?? null;
    }
    // No colors — first option for the age group
    return selectedGroup.options[0] ?? null;
  })();

  const images = [
    ...(product.cover_image_url ? [product.cover_image_url] : []),
    ...product.gallery.map((g) => g.url),
  ];

  function handleSelectAge(age: string) {
    setSelectedAge((prev) => (prev === age ? null : age));
    setSelectedColorValue(null);
  }

  function handleAddToCart() {
    if (!selectedOption || !selectedOption.in_stock) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
    // TODO: dispatch to cart store
  }

  // Price display
  const allPrices = groups.flatMap((g) => g.options.map((o) => parseFloat(o.price)));
  const minPrice = allPrices.length ? Math.min(...allPrices) : null;
  const maxPrice = allPrices.length ? Math.max(...allPrices) : null;
  const priceDisplay = selectedOption
    ? fmtPrice(selectedOption.price)
    : minPrice === null
      ? "—"
      : minPrice === maxPrice
        ? fmtPrice(String(minPrice))
        : `From ${fmtPrice(String(minPrice))}`;

  const ctaLabel = (() => {
    if (!selectedAge) return "Select a Size";
    if (hasColors && !selectedColorValue) return "Select a Colour";
    return "Add to Cart";
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left — image viewer */}
        <ProductImageViewer images={images} productName={product.name} />

        {/* Right — product info */}
        <div className="flex flex-col">
          {product.category && (
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
              {product.category.name}
            </p>
          )}

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 uppercase tracking-tight leading-tight mb-3">
            {product.name}
          </h1>

          {/* Price */}
          <p className="text-xl font-bold text-zinc-900 mb-6">
            {selectedOption?.compare_at_price ? (
              <span className="flex items-center gap-3">
                <span>{priceDisplay}</span>
                <span className="text-sm font-semibold text-zinc-400 line-through">
                  {fmtPrice(selectedOption.compare_at_price)}
                </span>
                <span className="text-xs font-black bg-red-600 text-white px-2 py-0.5">SALE</span>
              </span>
            ) : (
              priceDisplay
            )}
          </p>

          {/* ── Age group selector ── */}
          {groups.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                Age Group
                {selectedGroup && (
                  <span className="ml-2 text-zinc-900 normal-case font-semibold tracking-normal">
                    — {selectedGroup.age_group_display}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {groups.map((group) => {
                  const anyStock = group.options.some((o) => o.in_stock);
                  const isSelected = selectedAge === group.age_group;
                  return (
                    <button
                      key={group.age_group}
                      onClick={() => handleSelectAge(group.age_group)}
                      disabled={!anyStock}
                      className={`relative px-3.5 py-2 text-xs font-bold border-2 transition-all rounded
                        ${isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : !anyStock
                            ? "border-zinc-100 text-zinc-300 cursor-not-allowed"
                            : "border-zinc-200 text-zinc-700 hover:border-zinc-900"
                        }`}
                    >
                      {group.age_group_display}
                      {!anyStock && (
                        <span className="absolute inset-0 overflow-hidden rounded pointer-events-none">
                          <span className="absolute top-1/2 left-0 right-0 h-px bg-zinc-300 -rotate-12" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Colour selector ── */}
          {hasColors && selectedGroup && (
            <div className="mb-6">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                Colour
                {selectedColorValue && (
                  <span className="ml-2 text-zinc-900 normal-case font-semibold tracking-normal">
                    — {colorChoices.find((c) => c.value === selectedColorValue)?.display}
                  </span>
                )}
              </p>

              {colorChoices.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No colour options for this size.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {colorChoices.map((choice) => {
                    const isSelected = selectedColorValue === choice.value;
                    if (choice.hex) {
                      return (
                        <button
                          key={choice.value}
                          onClick={() =>
                            choice.inStock && setSelectedColorValue(isSelected ? null : choice.value)
                          }
                          disabled={!choice.inStock}
                          title={choice.inStock ? choice.display : `${choice.display} — Out of Stock`}
                          className={`relative w-9 h-9 rounded-full transition-all focus:outline-none
                            ${isSelected ? "ring-2 ring-offset-2 ring-zinc-900 scale-110" : ""}
                            ${!choice.inStock ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:scale-110"}
                          `}
                        >
                          <span
                            className="absolute inset-0 rounded-full border border-black/10"
                            style={{ backgroundColor: choice.hex }}
                          />
                          {isSelected && (
                            <span className="absolute inset-0 flex items-center justify-center">
                              <Check size={14} className={isLight(choice.hex) ? "text-zinc-900" : "text-white"} />
                            </span>
                          )}
                          {!choice.inStock && (
                            <span className="absolute inset-0 rounded-full overflow-hidden">
                              <span className="absolute top-1/2 left-0 right-0 h-px bg-zinc-500/60 -rotate-45" />
                            </span>
                          )}
                        </button>
                      );
                    }
                    // Text pill fallback
                    return (
                      <button
                        key={choice.value}
                        onClick={() =>
                          choice.inStock && setSelectedColorValue(isSelected ? null : choice.value)
                        }
                        disabled={!choice.inStock}
                        className={`relative px-4 py-2 text-sm font-semibold border-2 transition-all rounded
                          ${isSelected
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : !choice.inStock
                              ? "border-zinc-100 text-zinc-300 cursor-not-allowed"
                              : "border-zinc-200 text-zinc-700 hover:border-zinc-900"
                          }`}
                      >
                        {choice.display}
                        {!choice.inStock && (
                          <span className="absolute inset-0 overflow-hidden rounded pointer-events-none">
                            <span className="absolute top-1/2 left-0 right-0 h-px bg-zinc-300 -rotate-12" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Stock indicator */}
          {selectedOption && (
            <p className={`text-[11px] font-bold uppercase tracking-widest mb-5 ${
              selectedOption.in_stock ? "text-emerald-600" : "text-red-500"
            }`}>
              {selectedOption.in_stock
                ? `In Stock · ${selectedOption.stock_quantity} left`
                : "Out of Stock"}
            </p>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedOption || !selectedOption.in_stock || added}
            className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-colors rounded
              ${added
                ? "bg-emerald-600 text-white"
                : !selectedOption || !selectedOption.in_stock
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  : "bg-zinc-900 text-white hover:bg-zinc-700"
              }`}
          >
            {added ? (
              <><Check size={16} /> Added to Cart</>
            ) : (
              <><ShoppingBag size={16} /> {ctaLabel}</>
            )}
          </button>

          {product.description && (
            <div className="mt-8 pt-8 border-t border-zinc-100">
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                Description
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
