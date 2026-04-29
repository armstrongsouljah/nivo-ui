"use server";

import { serverApi } from "@/lib/server-api";
import type { OrderCreatePayload, OrderResponse } from "@/lib/api";

export async function createOrderAction(payload: OrderCreatePayload): Promise<OrderResponse> {
  return serverApi.orders.create(payload);
}
