import Link from "next/link";
import { serverApi } from "@/lib/server-api";
import StoreProductCard from "./StoreProductCard";

export default async function NewArrivals() {
  const products = await serverApi.products
    .list({ page_size: 8, new_arrivals: true })
    .catch(() => serverApi.products.list({ page_size: 8 }))
    .then((r) => r.results)
    .catch(() => []);

  return (
    <section id="new-arrivals" className="px-4 sm:px-6 py-12 sm:py-16 max-w-7xl mx-auto w-full">
      <div className="flex items-end justify-between mb-7">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-rose uppercase mb-1">
            Just In
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            New Arrivals
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-semibold text-ink underline underline-offset-4 decoration-ink/30 hover:text-ink/60 transition-colors whitespace-nowrap"
        >
          View All
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-ink/40 text-center py-12">No products yet.</p>
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
