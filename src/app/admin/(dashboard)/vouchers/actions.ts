"use server";

import { serverApi } from "@/lib/server-api";
import type { VoucherCreatePayload, VoucherDetail } from "@/lib/api";

export async function createVoucherAction(payload: VoucherCreatePayload): Promise<VoucherDetail> {
  return serverApi.vouchers.create(payload);
}

export async function getVoucherAction(shortCode: string): Promise<VoucherDetail> {
  return serverApi.vouchers.get(shortCode);
}

export async function adjustVoucherAmountAction(shortCode: string, amount: string): Promise<VoucherDetail> {
  return serverApi.vouchers.update(shortCode, { amount });
}

export async function revokeVoucherAction(shortCode: string): Promise<VoucherDetail> {
  return serverApi.vouchers.revoke(shortCode);
}

export async function renewVoucherAction(shortCode: string, extendDays: number): Promise<VoucherDetail> {
  return serverApi.vouchers.renew(shortCode, extendDays);
}
