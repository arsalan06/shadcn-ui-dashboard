import { cookies } from "next/headers";
import { openSession, SESSION_COOKIE } from "@/lib/session";
import { getActivityLog } from "@/lib/citadel-reports";

/** The signed-in user's daily automation log. Read-only. */
export async function GET() {
  const session = await openSession((await cookies()).get(SESSION_COOKIE)?.value);

  if (!session?.userid) {
    return Response.json({ ok: false, message: "Not signed in." }, { status: 401 });
  }

  try {
    const entries = await getActivityLog(session.userid);
    return Response.json({ ok: true, entries });
  } catch (error) {
    console.error("[activity] log failed:", error);
    return Response.json(
      { ok: false, message: "Could not load the activity log." },
      { status: 502 },
    );
  }
}
