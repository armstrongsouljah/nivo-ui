import { serverApi } from "@/lib/server-api";
import CollectionsClient from "./CollectionsClient";

export default async function CollectionsPage() {
  const [collectionsRes, productsRes] = await Promise.all([
    serverApi.featuredCollections.list().catch(() => ({ results: [] })),
    serverApi.products.list({ page_size: 200, is_active: true }).catch(() => ({ results: [] })),
  ]);

  return (
    <CollectionsClient
      initial={collectionsRes.results}
      products={productsRes.results}
    />
  );
}
