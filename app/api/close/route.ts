import { cookies } from "next/headers";
import { openSession, SESSION_COOKIE } from "@/lib/session";
import { getCorporateClose } from "@/lib/citadel-reports";

/**
 * The corporate rollup for one date. Read-only.
 *
 * A GET rather than part of the page render: the upstream report is slow
 * enough that blocking the first paint on it would leave the dashboard blank
 * for several seconds.
 */
export async function GET(request: Request) {
  const session = await openSession((await cookies()).get(SESSION_COOKIE)?.value);

  if (!session?.userid) {
    return Response.json({ ok: false, message: "Not signed in." }, { status: 401 });
  }

  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json(
      { ok: false, message: "Expected ?date=YYYY-MM-DD." },
      { status: 400 },
    );
  }

  try {
    // The service scopes the result to this user's own stores.
    const stores = await getCorporateClose(session.userid, date);
    return Response.json({ ok: true, date, stores });
  } catch (error) {
    console.error("[close] rollup failed:", error);
    return Response.json(
      { ok: false, message: "Could not load the report." },
      { status: 502 },
    );
  }
}
