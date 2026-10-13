import { SignJWT, jwtVerify, type JWTPayload } from "jose";

/**
 * The session is a signed, httpOnly cookie rather than a server-side file.
 *
 * Only identity goes in it. A successful login returns megabytes of location
 * detail; that is re-fetched per request instead of being carried in a header
 * on every navigation.
 *
 * Verification has to work in the proxy (edge runtime), so this uses jose
 * rather than node:crypto and stays free of node-only imports.
 */

export const SESSION_COOKIE = "citadel_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

export type SessionPayload = {
  userid: string;
  username: string;
  email: string | null;
  /** The service's own token, kept for calls that come to require it. */
  token: string | null;
  /**
   * The stores this user can see, from ShortLocationDetail at login. Only the
   * number and name are kept — the full detail runs to megabytes, and this is
   * all the reports need to label a row.
   */
  stores: { num: string; name: string }[];
};

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error(
      "SESSION_SECRET is not set. Copy .env.example to .env.local and fill it in.",
    );
  }
  return new TextEncoder().encode(value);
}

export async function sealSession(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function openSession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    // Expired, tampered with, or signed under a previous SESSION_SECRET.
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
} as const;
