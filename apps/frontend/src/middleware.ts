import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter for edge isolates
// Note: In a distributed edge environment (like Cloudflare Pages), this state is kept per-isolate.
// It will not be globally perfectly accurate, but it prevents sudden massive spam on a single node.
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

const RATE_LIMIT = 20; // Max requests per window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
  const path = request.nextUrl.pathname;

  // 1. Rate Limiting for API routes (especially /api/chat)
  if (path.startsWith('/api/chat')) {
    const now = Date.now();
    const rateLimitInfo = rateLimitMap.get(ip);

    if (rateLimitInfo) {
      if (now - rateLimitInfo.timestamp > RATE_LIMIT_WINDOW_MS) {
        // Reset window
        rateLimitMap.set(ip, { count: 1, timestamp: now });
      } else {
        rateLimitInfo.count++;
        if (rateLimitInfo.count > RATE_LIMIT) {
          return new NextResponse(
            JSON.stringify({ error: 'Too many requests. Please try again later.' }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': Math.ceil((RATE_LIMIT_WINDOW_MS - (now - rateLimitInfo.timestamp)) / 1000).toString(),
              },
            }
          );
        }
      }
    } else {
      rateLimitMap.set(ip, { count: 1, timestamp: now });
    }
  }

  // 2. Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. images in public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
