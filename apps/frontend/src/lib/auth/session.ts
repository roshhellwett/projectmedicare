import { createHmac, timingSafeEqual, randomBytes } from "crypto";

export const ADMIN_COOKIE = "jm_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

type SessionPayload = {
  /** issued at (epoch seconds) */
  iat: number;
  /** expires at (epoch seconds) */
  exp: number;
  /** random id so two sessions are never byte-identical */
  jti: string;
  /** username of the authenticated user */
  username?: string;
  /** role of the user: ADMIN or BILLER */
  role?: string;
};

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing or too short. Set a random 32+ character value.",
    );
  }
  return value;
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromB64url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(body: string): string {
  return b64url(createHmac("sha256", secret()).update(body).digest());
}

/** Constant-time string comparison that never throws on length mismatch. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // Still burn a comparison so timing does not leak the length.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export function createSessionToken(username?: string, role?: string): { token: string; maxAge: number } {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
    jti: randomBytes(8).toString("hex"),
    ...(username && { username }),
    ...(role && { role }),
  };
  const body = b64url(JSON.stringify(payload));
  return { token: `${body}.${sign(body)}`, maxAge: SESSION_TTL_SECONDS };
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  let expected: string;
  try {
    expected = sign(body);
  } catch {
    return false; // secret not configured -> never authenticated
  }
  if (!safeEqual(signature, expected)) return false;

  try {
    const payload = JSON.parse(
      fromB64url(body).toString("utf8"),
    ) as SessionPayload;
    return (
      typeof payload.exp === "number" &&
      payload.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export function getSessionPayload(token: string | undefined | null): SessionPayload | null {
  if (!verifySessionToken(token)) return null;
  try {
    const [body] = token!.split(".");
    return JSON.parse(fromB64url(body).toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 6,
  );
}

export function checkAdminPassword(candidate: unknown): boolean {
  if (typeof candidate !== "string" || !isAdminPasswordConfigured())
    return false;
  return safeEqual(candidate, process.env.ADMIN_PASSWORD as string);
}

export function hashPassword(password: string): string {
  return createHmac("sha256", secret()).update(password).digest("hex");
}
