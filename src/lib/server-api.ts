import { cookies } from "next/headers";
import type { PaginatedResponse, Category, CategoryDetail, Product, ProductDetail, ProductCreatePayload, ProductUpdatePayload, VariantCreatePayload, VariantUpdatePayload, GalleryImage, AttributeDetail, AttributeValueItem, FeaturedCollectionSummary, FeaturedCollectionDetail, FeaturedCollectionCreatePayload, FeaturedCollectionUpdatePayload } from "./api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, "");

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = await getAuthHeader();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...auth,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const serverApi = {
  attributes: {
    list: () =>
      request<PaginatedResponse<AttributeDetail>>("/attributes/?page_size=100"),
    create: (name: string) =>
      request<AttributeDetail>("/attributes/", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    delete: (id: string) =>
      request<void>(`/attributes/${id}/`, { method: "DELETE" }),
    listValues: (attributeId: string) =>
      request<PaginatedResponse<AttributeValueItem>>(`/attribute-values/?attribute_pk=${attributeId}`),
    createValue: (attributeId: string, payload: { value: string; display_value: string; metadata?: Record<string, string> }) =>
      request<AttributeValueItem>("/attribute-values/", {
        method: "POST",
        body: JSON.stringify({ attribute: attributeId, ...payload }),
      }),
    deleteValue: (_attributeId: string, valueId: string) =>
      request<void>(`/attribute-values/${valueId}/`, { method: "DELETE" }),
  },
  categories: {
    list: () =>
      request<PaginatedResponse<Category>>("/categories/?page_size=100"),
    create: (name: string) =>
      request<CategoryDetail>("/categories/", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    update: (id: string, name: string) =>
      request<CategoryDetail>(`/categories/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    delete: (id: string) =>
      request<void>(`/categories/${id}/`, { method: "DELETE" }),
  },
  products: {
    list: (params?: { page_size?: number; page?: number; search?: string; category?: string; new_arrivals?: boolean; is_active?: boolean }) => {
      const qs = new URLSearchParams();
      qs.set("page_size", String(params?.page_size ?? 50));
      if (params?.page && params.page > 1) qs.set("page", String(params.page));
      if (params?.search)                  qs.set("search",       params.search);
      if (params?.category)                qs.set("category",     params.category);
      if (params?.new_arrivals)            qs.set("new_arrivals", "true");
      if (params?.is_active !== undefined) qs.set("is_active",    params.is_active ? "true" : "false");
      return request<PaginatedResponse<Product>>(`/products/?${qs}`);
    },
    create: (payload: ProductCreatePayload) =>
      request<ProductDetail>("/products/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    get: (id: string) =>
      request<ProductDetail>(`/products/${id}/`),
    getBySlug: (slug: string) =>
      request<ProductDetail>(`/products/slug/${slug}/`),
    update: (id: string, payload: ProductUpdatePayload) =>
      request<ProductDetail>(`/products/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    createVariant: (productId: string, payload: VariantCreatePayload) =>
      request<void>("/product-variants/", {
        method: "POST",
        body: JSON.stringify({ product: productId, ...payload }),
      }),
    updateVariant: (productId: string, variantId: string, payload: VariantUpdatePayload) =>
      request<void>(`/product-variants/${variantId}/?product_pk=${productId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    deleteVariant: (productId: string, variantId: string) =>
      request<void>(`/product-variants/${variantId}/?product_pk=${productId}`, { method: "DELETE" }),
    addGalleryImage: (productId: string, payload: { url: string; alt_text?: string; position?: number }) =>
      request<GalleryImage>("/product-gallery/", {
        method: "POST",
        body: JSON.stringify({ product: productId, ...payload }),
      }),
    deleteGalleryImage: (productId: string, imageId: string) =>
      request<void>(`/product-gallery/${imageId}/?product_pk=${productId}`, { method: "DELETE" }),
  },
  featuredCollections: {
    list: () =>
      request<PaginatedResponse<FeaturedCollectionSummary>>("/products/featured-collections/?page_size=50"),
    get: (slug: string) =>
      request<FeaturedCollectionDetail>(`/products/featured-collections/${slug}/`),
    create: (payload: FeaturedCollectionCreatePayload) =>
      request<FeaturedCollectionDetail>("/products/featured-collections/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (slug: string, payload: FeaturedCollectionUpdatePayload) =>
      request<FeaturedCollectionDetail>(`/products/featured-collections/${slug}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (slug: string) =>
      request<void>(`/products/featured-collections/${slug}`, { method: "DELETE" }),
  },
};
