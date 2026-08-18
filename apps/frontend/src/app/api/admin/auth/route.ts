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

  let username: unknown;
  let password: unknown;
  try {
    ({ username, password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Small constant delay to blunt brute-force attempts.
  await new Promise((r) => setTimeout(r, 250));

  let role = "BILLER";

  // Superadmin Fallback
  if (username === "admin") {
    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }
    role = "ADMIN";
  } else {
    // Check against admin_users table
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const client = createAdminClient();
    if (!client) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const { data: user, error } = await client
      .from("admin_users")
      .select("password_hash, role")
      .eq("username", username)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
    }

    // Hash the candidate password and compare
    const { hashPassword, safeEqual } = await import("@/lib/auth/session");
    const candidateHash = hashPassword(password);
    
    if (!safeEqual(candidateHash, user.password_hash)) {
      return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
    }
    
    role = user.role;
  }

  const { token, maxAge } = createSessionToken(username, role);
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
