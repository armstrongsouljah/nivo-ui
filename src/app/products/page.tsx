import { Suspense } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StoreProductCard from "@/components/StoreProductCard";
import { serverApi } from "@/lib/server-api";
import ProductsSearch from "./ProductsSearch";
import Pagination from "./Pagination";

const PAGE_SIZE = 12;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const page = typeof sp.page === "string" ? Math.max(1, parseInt(sp.page, 10)) : 1;

  const [productsData, categoriesData] = await Promise.all([
    serverApi.products.list({ page_size: PAGE_SIZE, page, search: q, category }).catch(() => ({ results: [], count: 0, next: null, previous: null })),
    serverApi.categories.list().catch(() => ({ results: [], count: 0, next: null, previous: null })),
  ]);

  const totalPages = Math.ceil((productsData.count ?? 0) / PAGE_SIZE);

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="pt-14 sm:pt-16 min-h-screen">
        <section className="px-4 sm:px-6 py-12 max-w-7xl mx-auto w-full">
          <div className="mb-8">
            <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 uppercase mb-1">Browse</p>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 uppercase tracking-tight">
              All Products
            </h1>
          </div>

          <Suspense>
            <ProductsSearch
              categories={categoriesData.results}
              initialQ={q}
              initialCategory={category}
            />
          </Suspense>

          {productsData.results.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-zinc-400">
                {q || category ? "No products match your search." : "No products yet."}
              </p>
              {(q || category) && (
                <a href="/products" className="mt-4 inline-block text-xs font-bold tracking-widest uppercase underline underline-offset-4 text-zinc-900 hover:text-zinc-500 transition-colors">
                  Clear filters
                </a>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-zinc-400 mb-6">
                {productsData.count ?? productsData.results.length} product{(productsData.count ?? productsData.results.length) !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {productsData.results.map((product) => (
                  <StoreProductCard key={product.id} product={product} />
                ))}
              </div>
              <Suspense>
                <Pagination page={page} totalPages={totalPages} />
              </Suspense>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
