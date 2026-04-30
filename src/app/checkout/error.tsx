"use client";

import Link from "next/link";
import { ShoppingBag, RefreshCw } from "lucide-react";

export default function CheckoutError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-5">
          <ShoppingBag size={22} className="text-zinc-400" />
        </div>
        <h1 className="text-lg font-black text-zinc-900 uppercase tracking-tight mb-2">
          Checkout Unavailable
        </h1>
        <p className="text-sm text-zinc-500 mb-6">
          Something went wrong loading the checkout. Your cart is safe.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw size={12} /> Try Again
          </button>
          <Link
            href="/products"
            className="px-5 py-2.5 border border-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-zinc-50 transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    </div>
  );
}
