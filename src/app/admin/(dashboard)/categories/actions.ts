"use server";

import { serverApi } from "@/lib/server-api";
import type { CategoryDetail } from "@/lib/api";

export async function createCategoryAction(name: string): Promise<CategoryDetail> {
  return serverApi.categories.create(name);
}

export async function updateCategoryAction(id: string, name: string): Promise<CategoryDetail> {
  return serverApi.categories.update(id, name);
}

export async function deleteCategoryAction(id: string): Promise<void> {
  return serverApi.categories.delete(id);
}
