import "server-only";
import { createHash } from "node:crypto";

/**
 * Server-side client for the Citadel WCF service.
 *
 * The browser can never call this service directly: it serves plain http with
 * no CORS headers, so every request goes through a route handler. Keeping the
 * base url in an env var here is also what stops it reaching the client bundle.
 *
 * READ-ONLY by policy. Only AuthenticateUser (which the login flow requires)
 * and GET-shaped report/lookup calls belong in this file. Nothing here may
 * create, update or delete business data.
 */

const BASE = process.env.CITADEL_WCF_URL;

if (!BASE) {
  throw new Error(
    "CITADEL_WCF_URL is not set. Copy .env.example to .env.local and fill it in.",
  );
}

/** The service hashes passwords with unsalted md5 — its contract, not a choice. */
function legacyPasswordHash(password: string) {
  return createHash("md5").update(password).digest("hex");
}

/**
 * WCF serialises dates as `/Date(1739776808793-0600)/`, which neither
 * `new Date()` nor dayjs understands. Everything crossing this boundary goes
 * through here so no component ever sees the raw string.
 */
export function parseWcfDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /\/Date\((-?\d+)([+-]\d{4})?\)\//.exec(value);
  if (!match) return null;
  const ms = Number(match[1]);
  return Number.isFinite(ms) ? new Date(ms) : null;
}

export type LocationIp = {
  id: number;
  ip: string;
  locationid: string;
  status: boolean;
};

/**
 * Note the nesting: the ip list lives per location, not on the user. The PHP
 * app reads `UserData.location_ips` and `UserData.Location_IPs_List`, and
 * neither exists — which is why its store-ip check never matched.
 */
export type ShortLocationDetail = {
  locationid: string;
  name: string;
  number: string;
  city: string;
  state: string;
  is_operational: boolean;
  Location_IPs_List: LocationIp[] | null;
};

export type CitadelUserData = {
  userid: string | null;
  username: string | null;
  email: string | null;
  roles: unknown;
  locations: unknown;
  user_meta: Record<string, unknown> | null;
  notifications: boolean;
  unReadMessagesCount: number;
  ShortLocationDetail: ShortLocationDetail[] | null;
};

export type AuthenticateUserResult = {
  IsAuthenticated: boolean;
  Token: { Token: string } | null;
  UserMessage: string | null;
  PendingTrainings: unknown[] | null;
  UserData: CitadelUserData | null;
};

async function postJson<T>(operation: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${operation}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Citadel ${operation} responded ${res.status}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    // A redirect or an html error page lands here. The PHP client silently
    // turned this into null, which is what made a broken endpoint look like
    // a rejected password.
    throw new Error(`Citadel ${operation} returned a non-JSON body`);
  }
}

export async function authenticate(args: {
  username: string;
  password: string;
  ipAddress: string;
  userAgent: string;
}): Promise<AuthenticateUserResult> {
  const json = await postJson<{
    AuthenticateUserResult: AuthenticateUserResult;
  }>("AuthenticateUser", {
    username: args.username,
    password: legacyPasswordHash(args.password),
    ipAddress: args.ipAddress,
    userAgent: args.userAgent,
  });

  return json.AuthenticateUserResult;
}
