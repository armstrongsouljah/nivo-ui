import { notFound } from "next/navigation";
import { serverApi } from "@/lib/server-api";
import EditProductClient from "./EditProductClient";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categoriesRes] = await Promise.all([
    serverApi.products.get(id).catch(() => null),
    serverApi.categories.list().catch(() => ({ results: [] })),
  ]);

  if (!product) notFound();

  return (
    <EditProductClient
      product={product}
      initialCategories={categoriesRes.results}
    />
  );
}
