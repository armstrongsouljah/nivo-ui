"use server";

import { serverApi } from "@/lib/server-api";
import type { AttributeDetail, AttributeValueItem } from "@/lib/api";

export async function createAttributeAction(name: string): Promise<AttributeDetail> {
  return serverApi.attributes.create(name);
}

export async function deleteAttributeAction(id: string): Promise<void> {
  return serverApi.attributes.delete(id);
}

export async function createAttributeValueAction(
  attributeId: string,
  payload: { value: string; display_value: string; metadata?: Record<string, string> },
): Promise<AttributeValueItem> {
  return serverApi.attributes.createValue(attributeId, payload);
}

export async function deleteAttributeValueAction(
  attributeId: string,
  valueId: string,
): Promise<void> {
  return serverApi.attributes.deleteValue(attributeId, valueId);
}
