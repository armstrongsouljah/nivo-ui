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
      // proxy.ts runs on the Node.js runtime, where fetch has no
      // application-level timeout by default — without this, a slow/hung
      // auth backend would stall every /admin/* request indefinitely.
      signal: AbortSignal.timeout(5000),
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
      maxAge: jwtExpirySeconds(refreshed.access) ?? 60 * 60,
    });
    if (refreshed.refresh) {
      response.cookies.set("refresh_token", refreshed.refresh, {
        ...COOKIE_DEFAULTS,
        maxAge: jwtExpirySeconds(refreshed.refresh) ?? 60 * 60 * 24 * 7,
      });
      // user_role's cookie is otherwise only ever set once, at login, with
      // a maxAge based on that original refresh token. Since refresh
      // tokens keep rotating forward on every successful refresh, leaving
      // this un-renewed means it eventually expires and vanishes from the
      // browser while access_token/refresh_token are still very much
      // alive — isAuthenticated stays true but isAdmin flips false, which
      // silently bounces an actively-authenticated admin to "/". Renewing
      // it here, tied to the same refresh token's expiry, is exactly the
      // "accidental logout" this PR exists to eliminate.
      if (userRole) {
        response.cookies.set("user_role", userRole, {
          ...COOKIE_DEFAULTS,
          maxAge: jwtExpirySeconds(refreshed.refresh) ?? 60 * 60 * 24 * 7,
        });
      }
    }
    return response;
  }

  // Already logged in → skip the login page
  if (isLoginPage) {
    if (isAuthenticated && isAdmin) {
      return applyRefreshedCookies(NextResponse.redirect(new URL("/admin", request.url)));
    }
    return applyRefreshedCookies(NextResponse.next());
  }

  // All other /admin/* routes require an active admin session
  if (!isAuthenticated) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    // Only clear cookies once the refresh token is itself genuinely dead —
    // tryRefresh() only runs when it wasn't expired going in, so landing
    // here with a refresh failure can also mean a transient network/API
    // error, or a race with another request that already rotated it.
    // Wiping live cookies over a transient blip would force a real logout
    // instead of just retrying successfully next request.
    if (refreshToken && isJwtExpired(refreshToken)) {
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      response.cookies.delete("user_role");
    }
    return response;
  }

  if (!isAdmin) {
    // A refresh may have just rotated the tokens on this very request —
    // route through applyRefreshedCookies so they aren't discarded. The
    // old refresh token is already blacklisted server-side at this point,
    // so dropping the new one here would permanently break the session.
    return applyRefreshedCookies(NextResponse.redirect(new URL("/", request.url)));
  }

  return applyRefreshedCookies(NextResponse.next({ request }));
}

export const config = {
  matcher: ["/admin/:path*"],
};
