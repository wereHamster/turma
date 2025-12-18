import { type Authorizer, authorizer, Biscuit, biscuit, KeyPair, PrivateKey } from "@biscuit-auth/biscuit-wasm";
import type { NextRequest, NextResponse } from "next/server";

const sessionTokenCookieName = "__Host-STKN";

export async function attachSessionToken(res: NextResponse, input: SessionTokenInput) {
  const sessionToken = await createSessionToken(input);

  res.cookies.set(sessionTokenCookieName, sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function authorizeRequest(req: NextRequest): Promise<"UNAUTHENTICATED" | Authorizer> {
  const sessionToken = req.cookies.get(sessionTokenCookieName)?.value;
  if (!sessionToken) {
    return "UNAUTHENTICATED";
  }

  return verifySessionToken(sessionToken);
}

/*
 * Biscuit private and public keys. These are used to sign and verify
 * session tokens.
 *
 * The keys are optional. When not provided, the functions that need them
 * will throw an error.
 */
const { privateKey, publicKey } = (() => {
  const privateKeyString = process.env.BISCUIT_PRIVATE_KEY;
  if (!privateKeyString) {
    return {
      privateKey: undefined,
      publicKey: undefined,
    };
  } else {
    const privateKey = PrivateKey.fromString(privateKeyString);

    return {
      privateKey,
      publicKey: KeyPair.fromPrivateKey(privateKey).getPublicKey(),
    };
  }
})();

/**
 * A session token is a base64 encoded Biscuit.
 */
type SessionToken = string;

export interface SessionTokenInput {
  /**
   * The GitHub login of the user.
   */
  login: string;
}

async function createSessionToken(payload: SessionTokenInput): Promise<SessionToken> {
  if (!privateKey) {
    throw new Error("Biscuit keys not configured");
  }

  const builder = biscuit`
   user("${payload.login}");

   check if time($time), $time < ${new Date(Date.now() + 1000 * 60 * 60 * 8)};
  `;

  return builder.build(privateKey).toBase64();
}

async function verifySessionToken(sessionToken: SessionToken): Promise<"UNAUTHENTICATED" | Authorizer> {
  if (!publicKey) {
    throw new Error("Biscuit keys not configured");
  }

  let biscuit: Biscuit;
  try {
    biscuit = Biscuit.fromBase64(sessionToken, publicKey);
  } catch {}

  if (!biscuit) {
    return "UNAUTHENTICATED";
  }

  const auth = authorizer`
    time(${new Date()});

    allow if user($u);
  `;

  const authz = auth.buildAuthenticated(biscuit);
  try {
    authz.authorizeWithLimits({
      max_facts: 1000,
      max_iterations: 100,
      max_time_micro: 100_000,
    });
  } catch {
    return "UNAUTHENTICATED";
  }

  return authz;
}
