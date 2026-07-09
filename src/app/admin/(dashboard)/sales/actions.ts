"use server";

import { serverApi } from "@/lib/server-api";
import type { SaleListItem, SaleDetail, SaleCreatePayload, SalesSummary } from "@/lib/api";

export async function recordSaleAction(payload: SaleCreatePayload): Promise<SaleDetail> {
  return serverApi.sales.create(payload);
}

export async function fetchSalesAction(params: {
  start_date?: string;
  end_date?: string;
}): Promise<SaleListItem[]> {
  const res = await serverApi.sales.list(params);
  return res.results;
}

export async function fetchSalesSummaryAction(params: {
  period?: "week" | "month";
  start_date?: string;
  end_date?: string;
}): Promise<SalesSummary> {
  return serverApi.sales.summary(params);
}

export async function getSaleDetailAction(id: string): Promise<SaleDetail> {
  return serverApi.sales.get(id);
}
