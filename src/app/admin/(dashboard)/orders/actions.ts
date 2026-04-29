"use server";

import { serverApi } from "@/lib/server-api";
import type { OrderDetail } from "@/lib/api";

export async function updateOrderStatusAction(id: string, status: string): Promise<OrderDetail> {
  return serverApi.orders.update(id, { status });
}

export async function markOrderPaidAction(id: string, is_paid: boolean): Promise<OrderDetail> {
  return serverApi.orders.update(id, { is_paid });
}
