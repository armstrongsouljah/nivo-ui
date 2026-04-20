"use server";

import { signUploadParams, getCloudinaryCredentials } from "@/lib/cloudinary";
import { serverApi } from "@/lib/server-api";
import type {
  Category, CategoryDetail,
  ProductCreatePayload, ProductUpdatePayload, ProductDetail,
  VariantCreatePayload, VariantUpdatePayload,
  GalleryImage,
} from "@/lib/api";

// ─── Category actions ─────────────────────────────────────────────────────────

export async function createCategoryAction(name: string): Promise<CategoryDetail> {
  return serverApi.categories.create(name);
}

export async function updateCategoryAction(id: string, name: string): Promise<CategoryDetail> {
  return serverApi.categories.update(id, name);
}

export async function deleteCategoryAction(id: string): Promise<void> {
  return serverApi.categories.delete(id);
}

export async function listCategoriesAction(): Promise<Category[]> {
  const res = await serverApi.categories.list();
  return res.results;
}

export async function updateProductAction(id: string, payload: ProductUpdatePayload): Promise<ProductDetail> {
  return serverApi.products.update(id, payload);
}

export async function addVariantAction(productId: string, payload: VariantCreatePayload): Promise<void> {
  return serverApi.products.createVariant(productId, payload);
}

export async function updateVariantAction(productId: string, variantId: string, payload: VariantUpdatePayload): Promise<void> {
  return serverApi.products.updateVariant(productId, variantId, payload);
}

export async function deleteVariantAction(productId: string, variantId: string): Promise<void> {
  return serverApi.products.deleteVariant(productId, variantId);
}

export async function addGalleryImageAction(
  productId: string,
  payload: { url: string; alt_text?: string; position?: number },
): Promise<GalleryImage> {
  return serverApi.products.addGalleryImage(productId, payload);
}

export async function deleteGalleryImageAction(productId: string, imageId: string): Promise<void> {
  return serverApi.products.deleteGalleryImage(productId, imageId);
}

export async function createProductAction(
  product: ProductCreatePayload,
  variants: VariantCreatePayload[],
): Promise<ProductDetail> {
  const created = await serverApi.products.create(product);
  await Promise.all(variants.map((v) => serverApi.products.createVariant(created.id, v)));
  return created;
}

export async function getUploadSignature(folder: string): Promise<{
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}> {
  const { apiKey, cloudName } = getCloudinaryCredentials();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signUploadParams({ folder, timestamp });

  return { signature, timestamp, api_key: apiKey, cloud_name: cloudName, folder };
}
