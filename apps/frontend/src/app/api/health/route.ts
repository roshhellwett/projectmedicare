import { NextResponse } from "next/server";

/**
 * Lightweight health-check endpoint for external monitors.
 * Returns 200 with minimal CPU cost — no SSR, no Supabase queries.
 * This avoids the "Exceeded CPU Time Limits" 503 errors that occur
 * when the Render health checker hits full SSR pages like /en.
 */
export function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

export const runtime = "edge";
