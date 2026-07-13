"use server";

import { serverApi } from "@/lib/server-api";
import type { VoucherDetail } from "@/lib/api";

export async function adjustVoucherAmountAction(shortCode: string, amount: string): Promise<VoucherDetail> {
  return serverApi.vouchers.update(shortCode, { amount });
}

export async function revokeVoucherAction(shortCode: string): Promise<VoucherDetail> {
  return serverApi.vouchers.revoke(shortCode);
}

export async function renewVoucherAction(shortCode: string, extendDays: number): Promise<VoucherDetail> {
  return serverApi.vouchers.renew(shortCode, extendDays);
}
