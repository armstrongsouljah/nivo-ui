import Link from "next/link";
import { serverApi } from "@/lib/server-api";
import StoreProductCard from "./StoreProductCard";

export default async function NewArrivals() {
  const products = await serverApi.products
    .list({ page_size: 8, new_arrivals: true })
    .then((r) => r.results)
    .catch(() => []);

  return (
    <section id="new-arrivals" className="px-4 sm:px-6 py-12 sm:py-16 max-w-7xl mx-auto w-full">
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-1">
            Just Dropped
          </p>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 uppercase tracking-tight">
            New Arrivals
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold tracking-widest text-zinc-900 uppercase underline underline-offset-4 hover:text-zinc-500 transition-colors whitespace-nowrap"
        >
          View All
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-12">No products yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <StoreProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
