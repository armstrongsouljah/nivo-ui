"use server";

import { serverApi } from "@/lib/server-api";
import { signUploadParams, getCloudinaryCredentials } from "@/lib/cloudinary";
import type { FeaturedCollectionDetail, FeaturedCollectionCreatePayload, FeaturedCollectionUpdatePayload } from "@/lib/api";

export async function createCollectionAction(payload: FeaturedCollectionCreatePayload): Promise<FeaturedCollectionDetail> {
  return serverApi.featuredCollections.create(payload);
}

export async function updateCollectionAction(slug: string, payload: FeaturedCollectionUpdatePayload): Promise<FeaturedCollectionDetail> {
  return serverApi.featuredCollections.update(slug, payload);
}

export async function deleteCollectionAction(slug: string): Promise<void> {
  return serverApi.featuredCollections.delete(slug);
}

export async function getUploadSignature(folder: string): Promise<{
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
}> {
  const { apiKey, cloudName } = getCloudinaryCredentials();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signUploadParams({ folder, timestamp });
  return { signature, timestamp, api_key: apiKey, cloud_name: cloudName, folder };
}
