import { cookies, headers } from "next/headers";
import { authenticate } from "@/lib/citadel-api";
import { sealSession, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

/**
 * Login proxy. The browser posts here; this calls the WCF service.
 *
 * Differences from the PHP endpoint this replaces, all deliberate:
 *  - a failed login is 401, not 201 with `{"message": false}`
 *  - the service's own UserMessage is passed through, so "wrong password" and
 *    "account blocked" can be told apart
 *  - `reset_password` / `account_block` are dropped: they were hardcoded
 *    literals that carried no information
 */

export async function POST(request: Request) {
  let username = "";
  let password = "";

  try {
    const body = await request.json();
    username = typeof body.username === "string" ? body.username.trim() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ ok: false, message: "Malformed request." }, { status: 400 });
  }

  if (!username || !password) {
    return Response.json(
      { ok: false, message: "Enter your username and password." },
      { status: 400 },
    );
  }

  const headerList = await headers();
  const ipAddress =
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "127.0.0.1";

  let result;
  try {
    result = await authenticate({
      username,
      password,
      ipAddress,
      userAgent: headerList.get("user-agent") ?? "",
    });
  } catch (error) {
    // The backend was unreachable or answered with something that was not
    // JSON. That is an infrastructure problem, not a rejected credential, and
    // saying so saves the hours that conflating the two costs.
    console.error("[auth] backend call failed:", error);
    return Response.json(
      { ok: false, message: "Could not reach the Citadel service." },
      { status: 502 },
    );
  }

  const user = result.UserData;

  if (!result.IsAuthenticated || !user?.userid || !user.username) {
    return Response.json(
      { ok: false, message: result.UserMessage ?? "Sign in failed." },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    await sealSession({
      userid: user.userid,
      username: user.username,
      email: user.email,
      token: result.Token?.Token ?? null,
      stores: (user.ShortLocationDetail ?? [])
        .filter((l) => l?.locationid)
        .map((l) => ({ num: l.locationid, name: l.name })),
    }),
    sessionCookieOptions,
  );

  return Response.json({ ok: true });
}
