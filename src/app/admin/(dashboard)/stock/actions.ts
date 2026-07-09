"use server";

import { serverApi } from "@/lib/server-api";
import type { StockEntry } from "@/lib/api";

export async function adjustStockAction(
  variantId: string,
  change: number,
  notes: string,
): Promise<void> {
  await serverApi.stock.createTransaction({
    variant: variantId,
    change,
    type: "ADJUSTMENT",
    notes,
  });
}

export async function updateStockThresholdAction(
  stockId: number,
  low_stock_threshold: number,
): Promise<StockEntry> {
  return serverApi.stock.update(stockId, { low_stock_threshold });
}
