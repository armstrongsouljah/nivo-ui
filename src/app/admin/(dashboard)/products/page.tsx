import { serverApi } from "@/lib/server-api";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const [productsRes, categoriesRes] = await Promise.all([
    serverApi.products.list({ page_size: 100 }).catch(() => ({ results: [] })),
    serverApi.categories.list().catch(() => ({ results: [] })),
  ]);

  return (
    <ProductsClient
      initialProducts={productsRes.results}
      initialCategories={categoriesRes.results}
    />
  );
}
