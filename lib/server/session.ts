import { createHmac, timingSafeEqual } from "crypto";

// Lightweight stateless session: an HMAC-signed token stored in an httpOnly cookie.
// Zero external deps, Node runtime only (we guard routes in server components, not edge).

export const SESSION_COOKIE = "pool_session";
const MAX_AGE = 365 * 24 * 60 * 60; // 1 year (seconds)

function secret(): string {
  return process.env.AUTH_SECRET || "dev-insecure-secret-change-me";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signSession(userId: string): string {
  const payload = b64url(JSON.stringify({ uid: userId, iat: Date.now() }));
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { uid } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof uid === "string" ? uid : null;
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE,
};
