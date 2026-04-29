import { serverApi } from "@/lib/server-api";
import NewProductPage from "./NewProductClient";

export default async function Page() {
  const [categoriesRes, attributesRes] = await Promise.all([
    serverApi.categories.list().catch(() => ({ results: [] })),
    serverApi.attributes.list().catch(() => ({ results: [] })),
  ]);

  const attributes = await Promise.all(
    attributesRes.results.map((attr) =>
      serverApi.attributes
        .listValues(attr.id)
        .then((r) => ({ ...attr, values: r.results }))
        .catch(() => ({ ...attr, values: [] }))
    )
  );

  return (
    <NewProductPage
      initialCategories={categoriesRes.results}
      initialAttributes={attributes}
    />
  );
}
