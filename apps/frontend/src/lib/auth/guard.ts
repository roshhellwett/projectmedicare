import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken, getSessionPayload } from "./session";

/** Server-side check usable from server components and route handlers. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const payload = getSessionPayload(store.get(ADMIN_COOKIE)?.value);
  return !!payload && payload.role === "ADMIN";
}

/**
 * Guard for admin API routes.
 * Returns a 401 response when the caller is not an authenticated admin,
 * or `null` when the request may proceed.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdminAuthenticated()) return null;
  return NextResponse.json({ error: "Unauthorized - Admin Only" }, { status: 401 });
}

export async function isAnyStaffAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const payload = getSessionPayload(store.get(ADMIN_COOKIE)?.value);
  return !!payload && (payload.role === "ADMIN" || payload.role === "BILLER");
}

export async function requireAuth(): Promise<NextResponse | null> {
  if (await isAnyStaffAuthenticated()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
