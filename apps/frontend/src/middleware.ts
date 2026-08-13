import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";



// Simple in-memory rate limiter for edge isolates
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 20; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_ENTRIES = 5000; // Prevent unbounded memory growth

const intlMiddleware = createMiddleware(routing);

function cleanupRateLimitMap(now: number) {
  // Only cleanup when the map gets large enough to matter
  if (rateLimitMap.size <= RATE_LIMIT_MAX_ENTRIES) return;

  for (const [key, info] of rateLimitMap) {
    if (now - info.timestamp > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(key);
    }
  }

  // If still too large after cleanup, clear everything (emergency valve)
  if (rateLimitMap.size > RATE_LIMIT_MAX_ENTRIES) {
    rateLimitMap.clear();
  }
}

export default function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const path = request.nextUrl.pathname;

  // 1. Rate Limiting for API routes (especially /api/chat)
  if (path.startsWith("/api/chat")) {
    const now = Date.now();

    // Periodic cleanup to prevent memory leaks
    cleanupRateLimitMap(now);

    const rateLimitInfo = rateLimitMap.get(ip);

    if (rateLimitInfo) {
      if (now - rateLimitInfo.timestamp > RATE_LIMIT_WINDOW_MS) {
        // Reset window
        rateLimitMap.set(ip, { count: 1, timestamp: now });
      } else {
        rateLimitInfo.count++;
        if (rateLimitInfo.count > RATE_LIMIT) {
          return new NextResponse(
            JSON.stringify({
              error: "Too many requests. Please try again later.",
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": Math.ceil(
                  (RATE_LIMIT_WINDOW_MS - (now - rateLimitInfo.timestamp)) /
                    1000,
                ).toString(),
              },
            },
          );
        }
      }
    } else {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    }
  }

  // 2. Execute Internationalization OR pass-through for API routes
  let response;
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.includes(".")
  ) {
    response = NextResponse.next();
  } else {
    response = intlMiddleware(request);
  }

  // 3. Security Headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");

  return response;
}

export const config = {
  // Match all paths so we can run rate limits on APIs, but exclude static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
