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

export async function toggleProductStatusAction(id: string, is_active: boolean): Promise<void> {
  await serverApi.products.update(id, { is_active });
}

export async function addVariantAction(
  productId: string,
  payload: VariantCreatePayload,
  initialStock?: number,
): Promise<void> {
  const variant = await serverApi.products.createVariant(productId, payload);
  if (initialStock !== undefined) {
    await serverApi.stock.create({ variant: variant.id, quantity: initialStock });
  }
}

export async function updateVariantAction(
  productId: string,
  variantId: string,
  payload: VariantUpdatePayload,
  stockUpdate?: { stockId?: number; quantity: number },
): Promise<void> {
  await serverApi.products.updateVariant(productId, variantId, payload);
  if (stockUpdate !== undefined) {
    if (stockUpdate.stockId !== undefined) {
      await serverApi.stock.update(stockUpdate.stockId, { quantity: stockUpdate.quantity });
    } else {
      await serverApi.stock.create({ variant: variantId, quantity: stockUpdate.quantity });
    }
  }
}

export async function deleteVariantAction(productId: string, variantId: string): Promise<void> {
  return serverApi.products.deleteVariant(productId, variantId);
}

export async function addGalleryImageAction(
  productId: string,
  payload: { url: string; alt_text?: string; position?: number; is_feature?: boolean; variant_ids?: string[] },
): Promise<GalleryImage> {
  return serverApi.products.addGalleryImage(productId, payload);
}

export async function deleteGalleryImageAction(productId: string, imageId: string): Promise<void> {
  return serverApi.products.deleteGalleryImage(productId, imageId);
}

export async function createProductAction(
  product: ProductCreatePayload,
  variants: VariantCreatePayload[],
  stockQuantities?: number[],
): Promise<ProductDetail> {
  const created = await serverApi.products.create(product);
  const createdVariants = await Promise.all(
    variants.map((v) => serverApi.products.createVariant(created.id, v)),
  );
  if (stockQuantities) {
    await Promise.all(
      createdVariants.map((v, i) =>
        serverApi.stock.create({ variant: v.id, quantity: stockQuantities[i] ?? 0 }),
      ),
    );
  }
  return created;
}

export type UploadSignatureResult =
  | { ok: true; signature: string; timestamp: number; api_key: string; cloud_name: string; folder: string }
  | { ok: false; error: string };

export async function getUploadSignature(folder: string): Promise<UploadSignatureResult> {
  try {
    const { apiKey, cloudName } = getCloudinaryCredentials();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = signUploadParams({ folder, timestamp });
    console.log(`[cloudinary] sign ok — cloud=${cloudName} key=${apiKey.slice(0, 6)}… folder=${folder}`);
    return { ok: true, signature, timestamp, api_key: apiKey, cloud_name: cloudName, folder };
  } catch (err) {
    console.error("[cloudinary] sign failed —", err);
    return { ok: false, error: err instanceof Error ? err.message : "Image upload is not configured." };
  }
}
