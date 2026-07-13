import { NextRequest, NextResponse } from "next/server";
import { isJwtExpired, jwtExpirySeconds } from "@/lib/jwt";

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

interface RefreshResponse {
  access: string;
  // ROTATE_REFRESH_TOKENS is on in nivo-api, so a fresh refresh token is
  // always issued (and the old one blacklisted) — but keep this optional
  // in case that setting ever changes.
  refresh?: string;
}

async function tryRefresh(refreshToken: string): Promise<RefreshResponse | null> {
  if (!API_URL) return null;
  try {
    const res = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return null;
    return (await res.json()) as RefreshResponse;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  const accessToken  = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const userRole     = request.cookies.get("user_role")?.value;
  const isAdmin      = userRole === "admin";

  let validAccessToken = accessToken && !isJwtExpired(accessToken) ? accessToken : null;
  let refreshed: RefreshResponse | null = null;

  // Access token missing/expired but the refresh token might still be
  // good — silently refresh instead of forcing a full logout every time
  // the (much shorter-lived) access token expires.
  if (!validAccessToken && refreshToken && !isJwtExpired(refreshToken)) {
    refreshed = await tryRefresh(refreshToken);
    if (refreshed) {
      validAccessToken = refreshed.access;
      // Also mutate the incoming request's cookies, not just the response's
      // — Server Components rendered during *this* request read via
      // next/headers cookies(), which sees the request as it came in.
      // Without this, the page that triggered the refresh would still
      // render with the stale, expired token.
      request.cookies.set("access_token", refreshed.access);
      if (refreshed.refresh) request.cookies.set("refresh_token", refreshed.refresh);
    }
  }

  const isAuthenticated = !!validAccessToken;

  function applyRefreshedCookies(response: NextResponse) {
    if (!refreshed) return response;
    response.cookies.set("access_token", refreshed.access, {
      ...COOKIE_DEFAULTS,
      maxAge: jwtExpirySeconds(refreshed.access) ?? 60 * 15,
    });
    if (refreshed.refresh) {
      response.cookies.set("refresh_token", refreshed.refresh, {
        ...COOKIE_DEFAULTS,
        maxAge: jwtExpirySeconds(refreshed.refresh) ?? 60 * 60 * 24,
      });
    }
    return response;
  }

  // Already logged in → skip the login page
  if (isLoginPage) {
    if (isAuthenticated && isAdmin) {
      return applyRefreshedCookies(NextResponse.redirect(new URL("/admin", request.url)));
    }
    return NextResponse.next();
  }

  // All other /admin/* routes require an active admin session
  if (!isAuthenticated) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    // Refresh token was present but dead (expired/blacklisted) — clear it
    // so subsequent requests fail fast instead of retrying a dead refresh.
    if (refreshToken) {
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("user_role");
    }
    return response;
  }

  if (!isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return applyRefreshedCookies(NextResponse.next({ request }));
}

export const config = {
  matcher: ["/admin/:path*"],
};
