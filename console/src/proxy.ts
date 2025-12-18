import type { NextURL } from "next/dist/server/web/next-url";
import { type NextRequest, NextResponse } from "next/server";
import { authorizeRequest } from "./lib/auth";

export async function proxy(req: NextRequest) {
  /*
   * Completely deactivate auth in the following situations:
   * - Non-production environments (eg. local development).
   * - Vercel preview deployments (those are accessible only to team members anyway).
   */
  if (process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/_next/") || pathname.startsWith("/auth/")) {
    return NextResponse.next();
  }

  const authz = await authorizeRequest(req);
  if (authz === "UNAUTHENTICATED") {
    return NextResponse.redirect(withPath(req.nextUrl, "/auth/login"));
  }

  return NextResponse.next();
}

function withPath(url: NextURL, pathname: string): NextURL {
  const ret = url.clone();
  ret.pathname = pathname;
  return ret;
}
