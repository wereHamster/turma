import type { NextURL } from "next/dist/server/web/next-url";
import { type NextRequest, NextResponse } from "next/server";
import { attachSessionToken } from "../../../lib/auth";
import { appOptions } from "../../../lib/github/app";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const oauthState = req.cookies.get("state")?.value;

  if (!code || !state || state !== oauthState) {
    return NextResponse.redirect(withPath(req.nextUrl, "/auth/forbidden"));
  }

  const accessToken = await exchangeCodeForAccessToken(code);
  if (!accessToken) {
    return NextResponse.redirect(withPath(req.nextUrl, "/auth/forbidden"));
  }

  const ok = await isOrgMember(accessToken);
  if (!ok) {
    return NextResponse.redirect(withPath(req.nextUrl, "/auth/forbidden"));
  }

  const login = await getViewerLogin(accessToken);
  if (!login) {
    return NextResponse.redirect(withPath(req.nextUrl, "/auth/forbidden"));
  }

  const res = NextResponse.redirect(withPath(req.nextUrl, "/"));

  res.cookies.set("state", "", { path: "/", maxAge: 0 });

  attachSessionToken(res, { login });

  return res;
}

function withPath(url: NextURL, pathname: string): URL {
  const ret = url.clone();
  ret.pathname = pathname;
  ret.search = "";
  return ret;
}

async function exchangeCodeForAccessToken(code: string): Promise<null | string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: appOptions.oauth.clientId,
      client_secret: appOptions.oauth.clientSecret,
      code,
    }),
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data?.access_token;
}

async function isOrgMember(accessToken: string) {
  const org = process.env.GITHUB_ORG_NAME;
  if (!org) {
    throw new Error("GITHUB_ORG_NAME not configured");
  }

  // Returns 404 if not a member; includes "state": "active" if they are.
  const res = await fetch(`https://api.github.com/user/memberships/orgs/${org}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (res.status === 404) {
    return false;
  }

  if (!res.ok) {
    return false;
  }

  const data = await res.json();
  return data?.state === "active";
}

async function getViewerLogin(accessToken: string): Promise<null | string> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data?.login;
}
