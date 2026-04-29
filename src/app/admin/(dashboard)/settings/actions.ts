"use server";

import { serverApi } from "@/lib/server-api";
import type { AdminProfile } from "@/lib/api";

export async function updateProfileAction(payload: {
  first_name?: string;
  last_name?:  string;
  phone?:      string;
}): Promise<AdminProfile> {
  return serverApi.auth.updateProfile(payload);
}

export async function changePasswordAction(payload: {
  current_password:     string;
  new_password:         string;
  confirm_new_password: string;
}): Promise<void> {
  return serverApi.auth.changePassword(payload);
}
