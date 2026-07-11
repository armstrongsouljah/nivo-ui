"use server";

import { serverApi } from "@/lib/server-api";
import type { InvoiceDetail, InvoiceStatus } from "@/lib/api";

export async function updateInvoiceStatusAction(shortCode: string, status: InvoiceStatus): Promise<InvoiceDetail> {
  return serverApi.invoices.update(shortCode, { status });
}

export async function deleteInvoiceAction(shortCode: string): Promise<void> {
  await serverApi.invoices.delete(shortCode);
}
