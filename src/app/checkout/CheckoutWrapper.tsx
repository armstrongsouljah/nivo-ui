"use client";

import dynamic from "next/dynamic";
import { ShoppingBag } from "lucide-react";

const CheckoutClient = dynamic(() => import("./CheckoutClient"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center py-32 text-zinc-400">
      <ShoppingBag size={32} strokeWidth={1.2} />
    </div>
  ),
});

export default function CheckoutWrapper() {
  return <CheckoutClient />;
}
