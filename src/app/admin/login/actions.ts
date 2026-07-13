"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation"; // used by loginAction

// See server-api.ts: SERVER_API_URL is a runtime-only override for this
// server's own fetches, used when NEXT_PUBLIC_API_URL (frozen into the JS
// bundle at build time) isn't reachable from inside this process.
const API_URL = (process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const IS_PROD = process.env.NODE_ENV === "production";

const COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "lax" as const,
  path: "/",
};

interface LoginResponse {
  user: { role: string; email: string; first_name: string; last_name: string };
  tokens: { access: string; refresh: string };
}

export async function loginAction(
  _prevState: { error?: string; email?: string } | undefined,
  formData: FormData
): Promise<{ error: string; email: string }> {
  const email    = (formData.get("email")    as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null)          ?? "";

  if (!email || !password) {
    return { error: "Email and password are required.", email };
  }

  let data: LoginResponse;
  try {
    const res = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { detail?: string };
      return { error: body.detail ?? "Invalid email or password.", email };
    }

    data = (await res.json()) as LoginResponse;
  } catch {
    return { error: "Could not reach the server. Please try again.", email };
  }

  if (data.user.role !== "admin") {
    return { error: "Access denied. This dashboard is for admin accounts only.", email };
  }

  const cookieStore = await cookies();

  cookieStore.set("access_token", data.tokens.access, {
    ...COOKIE_DEFAULTS,
    maxAge: 60 * 15, // 15 min — matches API access token lifetime
  });

  cookieStore.set("refresh_token", data.tokens.refresh, {
    ...COOKIE_DEFAULTS,
    maxAge: 60 * 60 * 24, // 24 h
  });

  // Non-sensitive — used by proxy for role check without decoding JWT
  cookieStore.set("user_role", data.user.role, {
    ...COOKIE_DEFAULTS,
    maxAge: 60 * 60 * 24,
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get("refresh_token")?.value;

  if (refresh) {
    await fetch(`${API_URL}/auth/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    }).catch(() => {});
  }

  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("user_role");
}
