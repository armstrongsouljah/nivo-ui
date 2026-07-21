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
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-2xl bg-blush/40 mb-3">
        {product.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.cover_image_url}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-blush/40 flex items-center justify-center">
            <span className="text-ink/40 text-xs font-medium uppercase tracking-widest">No image</span>
          </div>
        )}

        {!product.in_stock && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold tracking-widest px-2 py-1 rounded-full bg-ink/80 text-cream">
            SOLD OUT
          </span>
        )}

        <button
          aria-label={`Quick view ${product.name}`}
          className="absolute bottom-0 left-0 right-0 z-20 bg-rose text-white text-xs font-semibold tracking-wide py-4 flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 invisible group-hover:visible transition-all duration-300 ease-in-out hover:bg-rose-dark"
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
        <p className="text-[11px] text-ink/50 uppercase tracking-widest">
          {product.category?.name ?? ""}
        </p>
        <h3 className="text-sm font-semibold text-ink leading-snug">{product.name}</h3>
        <div className="mt-1">
          {price ? (
            <span className="text-sm font-semibold text-ink">From {price}</span>
          ) : (
            <span className="text-xs text-ink/40">No variants yet</span>
          )}
        </div>
      </div>
    </Link>
  );
}
