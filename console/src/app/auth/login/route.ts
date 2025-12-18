import { type NextRequest, NextResponse } from "next/server";
import { appOptions } from "../../../lib/github/app";

export async function GET(req: NextRequest) {
  const callbackUrl = new URL("/auth/callback", req.nextUrl).toString();

  const state = crypto.randomUUID();

  const gh = new URL("https://github.com/login/oauth/authorize");
  gh.searchParams.set("client_id", appOptions.oauth.clientId);
  gh.searchParams.set("redirect_uri", callbackUrl);
  gh.searchParams.set("state", state);
  gh.searchParams.set("scope", "read:org read:user user:email");

  const res = NextResponse.redirect(gh);

  res.cookies.set("state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return res;
}
