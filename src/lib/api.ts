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

export interface VariantAttributeOption {
  name: string;
  slug: string;
  value: string;
  display: string;
  metadata: Record<string, string>;
}

export interface VariantOption {
  variant_id: string;
  sku: string;
  price: string;
  compare_at_price: string | null;
  in_stock: boolean;
  stock_quantity: number;
  attributes: VariantAttributeOption[];
}

export interface AgeGroupOptions {
  age_group: string;
  age_group_display: string;
  options: VariantOption[];
}

export interface AttributeValueItem {
  id: string;
  value: string;
  display_value: string;
  metadata: Record<string, string>;
}

export interface AttributeDetail {
  id: string;
  name: string;
  slug: string;
  values: AttributeValueItem[];
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

export interface FeaturedCollectionSummary {
  name: string;
  slug: string;
  product_count: number;
  cover_image_url: string;
  is_active: boolean;
}

export interface FeaturedCollectionDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_image_url: string;
  is_active: boolean;
  products: Product[];
  created_at: string;
  updated_at: string;
}

export interface FeaturedCollectionCreatePayload {
  name: string;
  description?: string;
  cover_image_url?: string;
  is_active?: boolean;
  products?: string[];
}

export interface FeaturedCollectionUpdatePayload {
  name?: string;
  description?: string;
  cover_image_url?: string;
  is_active?: boolean;
  products?: string[];
}

export interface GalleryImage {
  id: string;
  url: string;
  alt_text: string;
  position: number;
}

export interface ProductDetail extends Product {
  description: string;
  variant_options: AgeGroupOptions[];
  variants?: ProductVariantDetail[];
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
  attribute_value_ids?: string[];
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
  attributes: {
    list: () =>
      request<PaginatedResponse<AttributeDetail>>("/products/attributes/?page_size=100"),
  },
  featuredCollections: {
    list: () =>
      request<PaginatedResponse<FeaturedCollectionSummary>>("/products/featured-collections/?page_size=50"),
    get: (slug: string) =>
      request<FeaturedCollectionDetail>(`/products/featured-collections/${slug}`),
  },
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
