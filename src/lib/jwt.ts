function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as T;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const payload = decodeJwt<{ exp?: number }>(token);
  return !payload?.exp || Date.now() >= payload.exp * 1000;
}

// Seconds until the token's own exp claim — use this for cookie maxAge so
// the cookie's lifetime can't drift out of sync with the backend's actual
// SIMPLE_JWT lifetime settings. Falls back to null if the token can't be
// decoded, so callers can pick a sane default.
export function jwtExpirySeconds(token: string): number | null {
  const payload = decodeJwt<{ exp?: number }>(token);
  if (!payload?.exp) return null;
  const seconds = payload.exp - Math.floor(Date.now() / 1000);
  return seconds > 0 ? seconds : 0;
}
