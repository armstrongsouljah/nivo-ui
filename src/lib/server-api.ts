import { cookies } from "next/headers";
import type { PaginatedResponse, Category, CategoryDetail, Product, ProductDetail, ProductCreatePayload, ProductUpdatePayload, VariantCreatePayload, VariantUpdatePayload, GalleryImage } from "./api";

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
  categories: {
    list: () =>
      request<PaginatedResponse<Category>>("/products/categories/?page_size=100"),
    create: (name: string) =>
      request<CategoryDetail>("/products/categories/", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    update: (id: string, name: string) =>
      request<CategoryDetail>(`/products/categories/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    delete: (id: string) =>
      request<void>(`/products/categories/${id}/`, { method: "DELETE" }),
  },
  products: {
    list: (params?: { page_size?: number; search?: string; category?: string; new_arrivals?: boolean }) => {
      const qs = new URLSearchParams();
      qs.set("page_size", String(params?.page_size ?? 50));
      if (params?.search)        qs.set("search",       params.search);
      if (params?.category)      qs.set("category",     params.category);
      if (params?.new_arrivals)  qs.set("new_arrivals", "true");
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
      request<void>(`/products/${productId}/variants/`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateVariant: (productId: string, variantId: string, payload: VariantUpdatePayload) =>
      request<void>(`/products/${productId}/variants/${variantId}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    deleteVariant: (productId: string, variantId: string) =>
      request<void>(`/products/${productId}/variants/${variantId}/`, { method: "DELETE" }),
    addGalleryImage: (productId: string, payload: { url: string; alt_text?: string; position?: number }) =>
      request<GalleryImage>(`/products/${productId}/gallery/`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    deleteGalleryImage: (productId: string, imageId: string) =>
      request<void>(`/products/${productId}/gallery/${imageId}/`, { method: "DELETE" }),
  },
};
