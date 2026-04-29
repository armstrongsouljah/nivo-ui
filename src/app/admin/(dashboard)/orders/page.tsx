import { serverApi } from "@/lib/server-api";
import OrdersClient from "./OrdersClient";

export default async function OrdersPage() {
  const orders = await serverApi.orders
    .list({ page_size: 100 })
    .then((r) => r.results)
    .catch(() => []);

  return <OrdersClient initial={orders} />;
}
