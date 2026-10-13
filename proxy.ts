import { NextResponse, type NextRequest } from "next/server";
import { openSession, SESSION_COOKIE } from "@/lib/session";

/**
 * One gate in front of every app route.
 *
 * `middleware.ts` is deprecated in Next 16 — this is the `proxy.ts` that
 * replaced it. The matcher lets the sign-in page, the auth endpoints and the
 * static assets through; everything else needs a valid session.
 */

export async function proxy(request: NextRequest) {
  const session = await openSession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (session) return NextResponse.next();

  // An API call must not be answered with a redirect to an HTML page — the
  // caller is fetch(), not a browser navigation, and would parse the sign-in
  // page as its payload.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, message: "Not signed in." },
      { status: 401 },
    );
  }

  const signIn = new URL("/signin", request.url);
  // So a deep link survives the round trip through the sign-in form.
  if (request.nextUrl.pathname !== "/") {
    signIn.searchParams.set("next", request.nextUrl.pathname);
  }
  return NextResponse.redirect(signIn);
}

export const config = {
  matcher: [
    "/((?!signin|api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
