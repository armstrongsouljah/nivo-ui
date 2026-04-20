import { NextRequest, NextResponse } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64)) as { exp: number };
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  const accessToken = request.cookies.get("access_token")?.value;
  const userRole    = request.cookies.get("user_role")?.value;

  const isAuthenticated = !!accessToken && !isTokenExpired(accessToken);
  const isAdmin         = userRole === "admin";

  // Already logged in → skip the login page
  if (isLoginPage) {
    if (isAuthenticated && isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // All other /admin/* routes require an active admin session
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (!isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
