const BASE_URL = process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, "");

export interface PaginatedResponse<T> {
  results: T[];
  next: string | null;
  previous: string | null;
  count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryDetail extends Category {
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category | null;
  cover_image_url: string | null;
  is_active: boolean;
  in_stock: boolean;
  starting_price: string | null;
}

export interface ProductCreatePayload {
  name: string;
  slug: string;
  description: string;
  category: string | null;
  cover_image_url: string;
  is_active: boolean;
}

export interface VariantCreatePayload {
  age_group: string;
  attribute_value_ids: string[];
  sku: string;
  price: string;
  compare_at_price: string;
  stock_quantity: number;
  is_active: boolean;
}

export interface VariantAttribute {
  attribute_id: string;
  attribute: string;
  value_id: string;
  value: string;
  metadata: Record<string, string>;
}

export interface ProductVariantDetail {
  id: string;
  sku: string;
  price: string;
  compare_at_price: string | null;
  stock_quantity: number;
  age_group: string;
  is_active: boolean;
  attributes: VariantAttribute[];
}

export interface GalleryImage {
  id: string;
  url: string;
  alt_text: string;
  position: number;
}

export interface ProductDetail extends Product {
  description: string;
  variants: ProductVariantDetail[];
  gallery: GalleryImage[];
}

export interface ProductUpdatePayload {
  name?: string;
  slug?: string;
  description?: string;
  category?: string | null;
  cover_image_url?: string;
  is_active?: boolean;
}

export interface VariantUpdatePayload {
  price?: string;
  compare_at_price?: string;
  stock_quantity?: number;
  age_group?: string;
  is_active?: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
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
};
