import { parseDjangoError } from "./parse-api-error";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export interface PaginatedResponse<T> {
  results: T[];
  next: string | null;
  previous: string | null;
  count?: number;
}

export interface AdminProfile {
  id:                string;
  email:             string;
  first_name:        string;
  last_name:         string;
  full_name:         string;
  phone:             string;
  role:              string;
  is_email_verified: boolean;
  date_joined:       string;
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
  value_count: number;
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

export interface ShippingAddress {
  full_name:      string;
  phone:          string;
  address_line_1: string;
  address_line_2?: string;
  city:           string;
  country:        string;
}

export interface OrderItemPayload {
  product_variant?: string;
  price_at_purchase: string;
  quantity:          number;
  variant_label:     string;
}

export interface OrderCreatePayload {
  total_price:      string;
  shipping_cost?:   string;
  tax_amount?:      string;
  shipping_address: ShippingAddress;
  items:            OrderItemPayload[];
}

export interface OrderItemDetail {
  id:                string;
  product:           string | null;
  product_variant:   string | null;
  price_at_purchase: string;
  quantity:          number;
  variant_label:     string;
  subtotal:          number;
}

export interface OrderSummary {
  id:           string;
  secure_code:  string | null;
  status:       string;
  is_paid:      boolean;
  total_price:  string;
  shipping_cost: string;
  created_at:   string;
  user:         string | null;
}

export interface OrderDetail extends OrderSummary {
  tax_amount:       string;
  shipping_address: ShippingAddress;
  items:            OrderItemDetail[];
  updated_at:       string;
}

export interface OrderResponse {
  id:               string;
  secure_code:      string | null;
  status:           string;
  is_paid:          boolean;
  total_price:      string;
  shipping_cost:    string;
  shipping_address: ShippingAddress;
  created_at:       string;
}

export interface CartItemPayload {
  product_variant: string;
  quantity: number;
}

export interface CartItemResponse {
  id: string;
  cart: string;
  product_variant: string;
  quantity: number;
}

export interface CartResponse {
  id: string;
  user: string | null;
  items: CartItemResponse[];
  total_price: string;
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
  if (!BASE_URL) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(parseDjangoError(text, res.status));
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  attributes: {
    list: () =>
      request<PaginatedResponse<AttributeDetail>>("/attributes/?page_size=100"),
    listValues: (attributeId: string) =>
      request<PaginatedResponse<AttributeValueItem>>(`/attribute-values/?attribute_pk=${attributeId}`),
  },
  featuredCollections: {
    list: () =>
      request<PaginatedResponse<FeaturedCollectionSummary>>("/products/featured-collections/?page_size=50"),
    get: (slug: string) =>
      request<FeaturedCollectionDetail>(`/products/featured-collections/${slug}`),
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
  cart: {
    get: (id: string) =>
      request<CartResponse>(`/cart/${id}`),
    create: (items: CartItemPayload[]) =>
      request<CartResponse>("/cart/", {
        method: "POST",
        body: JSON.stringify({ items }),
      }),
    update: (id: string, items: CartItemPayload[]) =>
      request<CartResponse>(`/cart/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ items }),
      }),
    delete: (id: string) =>
      request<void>(`/cart/${id}`, { method: "DELETE" }),
  },
  orders: {
    create: (payload: OrderCreatePayload) =>
      request<OrderResponse>("/orders/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    get: (id: string) =>
      request<OrderResponse>(`/orders/${id}/`),
  },
};
