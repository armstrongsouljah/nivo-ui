export interface Order {
  id: string;
  customer: string;
  email: string;
  items: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
  payment: "Paid" | "Unpaid" | "Refunded";
}

export interface TopProduct {
  id: number;
  name: string;
  category: string;
  sold: number;
  revenue: number;
  stock: number;
  image: string;
}

export interface MonthlyStat {
  month: string;
  revenue: number;
  orders: number;
}

export const kpiStats = {
  revenue: { value: 54834000, change: 12.4, label: "Total Revenue", prefix: "UGX" },
  orders: { value: 348, change: 8.1, label: "Total Orders", prefix: "" },
  customers: { value: 1204, change: 5.6, label: "Customers", prefix: "" },
  avgOrder: { value: 157620, change: -2.3, label: "Avg. Order Value", prefix: "UGX" },
};

export const recentOrders: Order[] = [
  { id: "#ORD-5081", customer: "Amara Osei",     email: "amara@example.com",   items: 3, total: 321900,  status: "Delivered",  date: "Apr 14, 2026", payment: "Paid" },
  { id: "#ORD-5080", customer: "Liam Mensah",    email: "liam@example.com",    items: 1, total: 81400,   status: "Shipped",    date: "Apr 14, 2026", payment: "Paid" },
  { id: "#ORD-5079", customer: "Nana Akoto",     email: "nana@example.com",    items: 2, total: 233100,  status: "Processing", date: "Apr 13, 2026", payment: "Paid" },
  { id: "#ORD-5078", customer: "Kofi Boateng",   email: "kofi@example.com",    items: 4, total: 414400,  status: "Pending",    date: "Apr 13, 2026", payment: "Unpaid" },
  { id: "#ORD-5077", customer: "Esi Asante",     email: "esi@example.com",     items: 1, total: 140600,  status: "Delivered",  date: "Apr 12, 2026", payment: "Paid" },
  { id: "#ORD-5076", customer: "Kwame Darko",    email: "kwame@example.com",   items: 2, total: 207200,  status: "Cancelled",  date: "Apr 12, 2026", payment: "Refunded" },
  { id: "#ORD-5075", customer: "Abena Frimpong", email: "abena@example.com",   items: 3, total: 351500,  status: "Shipped",    date: "Apr 11, 2026", payment: "Paid" },
  { id: "#ORD-5074", customer: "Yaw Poku",       email: "yaw@example.com",     items: 1, total: 66600,   status: "Delivered",  date: "Apr 11, 2026", payment: "Paid" },
  { id: "#ORD-5073", customer: "Akosua Ntim",    email: "akosua@example.com",  items: 2, total: 273800,  status: "Processing", date: "Apr 10, 2026", payment: "Paid" },
  { id: "#ORD-5072", customer: "Fiifi Aidoo",    email: "fiifi@example.com",   items: 5, total: 518000,  status: "Delivered",  date: "Apr 10, 2026", payment: "Paid" },
];

export const topProducts: TopProduct[] = [
  { id: 1, name: "Sport Pullover Hoodie",  category: "Hoodies",     sold: 124, revenue: 17434400, stock: 38, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=80&q=70" },
  { id: 2, name: "Cargo Jogger Pants",     category: "Bottoms",     sold: 98,  revenue: 16317000, stock: 14, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&q=70" },
  { id: 3, name: "Graphic Print Tee",      category: "Tops",        sold: 211, revenue: 14052600, stock: 62, image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=80&q=70" },
  { id: 4, name: "Classic Snapback Cap",   category: "Accessories", sold: 87,  revenue: 7081800,  stock: 5,  image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=80&q=70" },
  { id: 5, name: "Zip-Up Track Jacket",    category: "Tops",        sold: 63,  revenue: 11655000, stock: 22, image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=80&q=70" },
];

export const monthlySales: MonthlyStat[] = [
  { month: "Nov", revenue: 22940000,  orders: 148 },
  { month: "Dec", revenue: 36260000,  orders: 231 },
  { month: "Jan", revenue: 27380000,  orders: 178 },
  { month: "Feb", revenue: 29970000,  orders: 195 },
  { month: "Mar", revenue: 41440000,  orders: 267 },
  { month: "Apr", revenue: 54834000,  orders: 348 },
];

export const orderStatusBreakdown = [
  { status: "Delivered",  count: 198, color: "#22c55e" },
  { status: "Shipped",    count: 72,  color: "#3b82f6" },
  { status: "Processing", count: 48,  color: "#f59e0b" },
  { status: "Pending",    count: 21,  color: "#a1a1aa" },
  { status: "Cancelled",  count: 9,   color: "#ef4444" },
];
