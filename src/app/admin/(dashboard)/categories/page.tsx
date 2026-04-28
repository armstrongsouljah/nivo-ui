import { serverApi } from "@/lib/server-api";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const categories = await serverApi.categories
    .list()
    .then((r) => r.results)
    .catch(() => []);

  return <CategoriesClient initial={categories} />;
}
