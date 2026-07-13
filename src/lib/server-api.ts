import { cookies } from "next/headers";
import { parseDjangoError } from "./parse-api-error";
import type { PaginatedResponse, Category, CategoryDetail, Product, ProductDetail, ProductVariantDetail, ProductCreatePayload, ProductUpdatePayload, VariantCreatePayload, VariantUpdatePayload, GalleryImage, AttributeDetail, AttributeValueItem, FeaturedCollectionSummary, FeaturedCollectionDetail, FeaturedCollectionCreatePayload, FeaturedCollectionUpdatePayload, OrderSummary, OrderDetail, OrderCreatePayload, OrderResponse, AdminProfile, StockEntry, StockCreatePayload, StockUpdatePayload, StockTransactionCreatePayload, SaleListItem, SaleDetail, SaleCreatePayload, SalesSummary, UserSummary, InvoiceListItem, InvoiceDetail, InvoiceUpdatePayload } from "./api";

// SERVER_API_URL is a runtime (not build-time inlined) override for where
// this server issues its own fetches — useful when the browser-reachable
// NEXT_PUBLIC_API_URL (frozen into the JS bundle at build time) isn't
// reachable from inside this process, e.g. "localhost" from within a
// docker-compose container needs to be "host.docker.internal" instead.
const BASE_URL = (process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

async function getAuthHeader(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE_URL) throw new Error("SERVER_API_URL or NEXT_PUBLIC_API_URL is not configured");
  const auth = await getAuthHeader();

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...auth,
        ...init?.headers,
      },
    });
  } catch (err) {
    // A raw connection failure (e.g. the API isn't running) throws an
    // AggregateError with no usable message once it crosses the Server
    // Component boundary. Re-throw with a clear message instead.
    console.error(`[server-api] ${init?.method ?? "GET"} ${path} → network error\n`, err);
    throw new Error(`Could not reach the API at ${BASE_URL}. Is it running?`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[server-api] ${init?.method ?? "GET"} ${path} → ${res.status}\n`, text.slice(0, 2000));
    throw new Error(parseDjangoError(text, res.status));
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
      request<ProductVariantDetail>("/product-variants/", {
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
    addGalleryImage: (productId: string, payload: { url: string; alt_text?: string; position?: number; is_feature?: boolean; variant_ids?: string[] }) =>
      request<GalleryImage>("/product-gallery/", {
        method: "POST",
        body: JSON.stringify({ product: productId, ...payload }),
      }),
    deleteGalleryImage: (productId: string, imageId: string) =>
      request<void>(`/product-gallery/${imageId}/?product_pk=${productId}`, { method: "DELETE" }),
  },
  stock: {
    list: (variantId?: string) => {
      const qs = variantId ? `?variant_pk=${variantId}` : "";
      return request<PaginatedResponse<StockEntry>>(`/stock/${qs}`);
    },
    create: (payload: StockCreatePayload) =>
      request<StockEntry>("/stock/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: number, payload: StockUpdatePayload) =>
      request<StockEntry>(`/stock/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    createTransaction: (payload: StockTransactionCreatePayload) =>
      request<void>("/stock/transactions/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  sales: {
    list: (params?: { start_date?: string; end_date?: string; page_size?: number }) => {
      const qs = new URLSearchParams();
      qs.set("page_size", String(params?.page_size ?? 100));
      if (params?.start_date) qs.set("start_date", params.start_date);
      if (params?.end_date)   qs.set("end_date",   params.end_date);
      return request<PaginatedResponse<SaleListItem>>(`/sales/?${qs}`);
    },
    get: (id: string) =>
      request<SaleDetail>(`/sales/${id}/`),
    create: (payload: SaleCreatePayload) =>
      request<SaleDetail>("/sales/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    summary: (params?: { period?: "week" | "month"; start_date?: string; end_date?: string }) => {
      const qs = new URLSearchParams();
      if (params?.period)     qs.set("period",     params.period);
      if (params?.start_date) qs.set("start_date", params.start_date);
      if (params?.end_date)   qs.set("end_date",   params.end_date);
      const suffix = qs.toString() ? `?${qs}` : "";
      return request<SalesSummary>(`/sales/summary/${suffix}`);
    },
  },
  invoices: {
    list: (params?: { page?: number; page_size?: number; status?: string }) => {
      const qs = new URLSearchParams();
      qs.set("pagination_type", "page");
      qs.set("page_size", String(params?.page_size ?? 15));
      if (params?.page && params.page > 1) qs.set("page", String(params.page));
      if (params?.status) qs.set("status", params.status);
      return request<PaginatedResponse<InvoiceListItem>>(`/invoices/?${qs}`);
    },
    get: (shortCode: string) =>
      request<InvoiceDetail>(`/invoices/${shortCode}/`),
    update: (shortCode: string, payload: InvoiceUpdatePayload) =>
      request<InvoiceDetail>(`/invoices/${shortCode}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (shortCode: string) =>
      request<void>(`/invoices/${shortCode}/`, { method: "DELETE" }),
  },
  featuredCollections: {
    list: () =>
      request<PaginatedResponse<FeaturedCollectionSummary>>("/featured-collections/?page_size=50"),
    get: (slug: string) =>
      request<FeaturedCollectionDetail>(`/featured-collections/${slug}/`),
    create: (payload: FeaturedCollectionCreatePayload) =>
      request<FeaturedCollectionDetail>("/featured-collections/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (slug: string, payload: FeaturedCollectionUpdatePayload) =>
      request<FeaturedCollectionDetail>(`/featured-collections/${slug}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (slug: string) =>
      request<void>(`/featured-collections/${slug}`, { method: "DELETE" }),
  },
  orders: {
    list: (params?: { status?: string; page?: number; page_size?: number }) => {
      const qs = new URLSearchParams();
      qs.set("page_size", String(params?.page_size ?? 50));
      if (params?.page && params.page > 1) qs.set("page", String(params.page));
      if (params?.status) qs.set("status", params.status);
      return request<PaginatedResponse<OrderSummary>>(`/orders/?${qs}`);
    },
    create: (payload: OrderCreatePayload) =>
      request<OrderResponse>("/orders/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    get: (id: string) =>
      request<OrderDetail>(`/orders/${id}/`),
    update: (id: string, payload: { status?: string; is_paid?: boolean }) =>
      request<OrderDetail>(`/orders/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    stats: () =>
      request<Record<string, number>>("/orders/stats/"),
    revenue: () =>
      request<{ month: string; revenue: number; order_revenue: number; sales_revenue: number; orders: number }[]>("/orders/revenue/"),
    kpi: () =>
      request<{
        revenue:   { value: number; change: number };
        orders:    { value: number; change: number };
        customers: { value: number; change: number };
        avg_order: { value: number; change: number };
      }>("/orders/kpi/"),
    analytics: (period: number = 30) =>
      request<{
        period_days: number;
        totals:      { revenue: number; order_revenue: number; sales_revenue: number; orders: number; avg_order: number };
        trend:       { date: string; revenue: number; orders: number }[];
        top_products: { label: string; revenue: number; quantity: number }[];
        top_cities:  { city: string; orders: number }[];
        fulfillment: {
          total: number; delivered: number; in_progress: number;
          pending: number; cancelled: number; rate: number;
        };
      }>(`/orders/analytics/?period=${period}`),
  },
  auth: {
    profile: () =>
      request<AdminProfile>("/auth/profile/"),
    updateProfile: (payload: { first_name?: string; last_name?: string; phone?: string }) =>
      request<AdminProfile>("/auth/profile/", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    changePassword: (payload: { current_password: string; new_password: string; confirm_new_password: string }) =>
      request<void>("/auth/password/change/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  users: {
    list: (params?: { page_size?: number }) => {
      const qs = new URLSearchParams();
      qs.set("page_size", String(params?.page_size ?? 100));
      return request<PaginatedResponse<UserSummary>>(`/auth/users/?${qs}`);
    },
    // Follows cursor-pagination's `next` link until exhausted, so directory-wide
    // views (search, filters, KPI totals) see every account, not just page one.
    listAll: async (): Promise<UserSummary[]> => {
      const all: UserSummary[] = [];
      let path: string | null = `/auth/users/?page_size=100`;
      while (path) {
        const res: PaginatedResponse<UserSummary> = await request<PaginatedResponse<UserSummary>>(path);
        all.push(...res.results);
        // Extract path+query rather than string-stripping BASE_URL — `next` is
        // built server-side from the request's own host, which can differ from
        // NEXT_PUBLIC_API_URL (e.g. localhost vs 127.0.0.1) and silently leave
        // BASE_URL unstripped, producing a malformed doubled-up URL on the next
        // fetch and crashing with an opaque AggregateError.
        path = res.next ? new URL(res.next).pathname + new URL(res.next).search : null;
      }
      return all;
    },
  },
};
