import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkAdminPassword,
  createSessionToken,
  isAdminPasswordConfigured,
} from "@/lib/auth/session";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function POST(req: NextRequest) {
  if (!isAdminPasswordConfigured() || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json(
      {
        error:
          "Admin login is not configured on the server (ADMIN_PASSWORD / ADMIN_SESSION_SECRET).",
      },
      { status: 503 },
    );
  }

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Small constant delay to blunt brute-force attempts.
  await new Promise((r) => setTimeout(r, 250));

  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const { token, maxAge } = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, { ...cookieBase, maxAge });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { ...cookieBase, maxAge: 0 });
  res.cookies.set("admin_store_id", "", { ...cookieBase, maxAge: 0 });
  return res;
}
