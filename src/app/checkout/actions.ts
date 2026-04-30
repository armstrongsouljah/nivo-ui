"use server";

import { serverApi } from "@/lib/server-api";
import type { OrderCreatePayload, OrderResponse } from "@/lib/api";

export type CreateOrderResult =
  | { ok: true;  order: OrderResponse }
  | { ok: false; error: string };

export async function createOrderAction(
  payload: OrderCreatePayload,
): Promise<CreateOrderResult> {
  try {
    const order = await serverApi.orders.create(payload);
    return { ok: true, order };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to place order. Please try again." };
  }
}
