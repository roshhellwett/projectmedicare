/**
 * Janta Medicare — bulletin cleanup worker.
 *
 * Deletes expired offers from Supabase on a fixed schedule by calling the
 * `purge_expired_bulletins(grace_hours)` SQL function with the service role key.
 *
 * Design notes:
 *  - Zero dependencies and zero local state, so the worker can be moved to a
 *    fresh Railway project at any time without migration or data loss.
 *  - Idempotent: running two instances, or none for a while, is harmless.
 *  - The website hides expired offers through RLS anyway; this is housekeeping.
 */

import http from "node:http";

const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const INTERVAL_MINUTES = clampNumber(
  process.env.PURGE_INTERVAL_MINUTES,
  60,
  5,
  1440,
);
const GRACE_HOURS = clampNumber(process.env.PURGE_GRACE_HOURS, 24, 0, 720);
const RUN_ONCE = /^(1|true|yes)$/i.test(process.env.RUN_ONCE || "");
const PORT = Number(process.env.PORT) || 0;

let lastRun = { at: null, removed: null, ok: null, error: null };

function clampNumber(raw, fallback, min, max) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function log(level, message, extra = {}) {
  const line = { ts: new Date().toISOString(), level, message, ...extra };
  console[level === "error" ? "error" : "log"](JSON.stringify(line));
}

function requireConfig() {
  const missing = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SERVICE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length) {
    log("error", "Missing required environment variables", { missing });
    process.exit(1);
  }
}

async function purgeOnce() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/purge_expired_bulletins`,
      {
        method: "POST",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ grace_hours: GRACE_HOURS }),
        signal: controller.signal,
      },
    );

    const text = await res.text();
    if (!res.ok)
      throw new Error(
        `Supabase responded ${res.status}: ${text.slice(0, 300)}`,
      );

    const removed = Number(text) || 0;
    lastRun = { at: new Date().toISOString(), removed, ok: true, error: null };
    log("info", "Purge complete", { removed, graceHours: GRACE_HOURS });
    return removed;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    lastRun = {
      at: new Date().toISOString(),
      removed: null,
      ok: false,
      error: message,
    };
    log("error", "Purge failed — will retry next cycle", { error: message });
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function startHealthServer() {
  if (!PORT) return;

  const rateLimitMap = new Map();

  const server = http.createServer((req, res) => {
    const ip = req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Cleanup old entries randomly to avoid memory leaks
    if (Math.random() < 0.01) rateLimitMap.clear();

    const info = rateLimitMap.get(ip) || { count: 0, ts: now };
    if (now - info.ts > 60000) {
      info.count = 1;
      info.ts = now;
    } else {
      info.count++;
    }
    rateLimitMap.set(ip, info);

    if (info.count > 30) {
      res.writeHead(429, { "Content-Type": "text/plain" });
      res.end("Too Many Requests");
      return;
    }

    if (req.url === "/healthz" || req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          intervalMinutes: INTERVAL_MINUTES,
          lastRun,
        }),
      );
      return;
    }
    res.writeHead(404).end();
  });
  server.listen(PORT, () =>
    log("info", "Health endpoint listening", { port: PORT }),
  );
  return server;
}

async function main() {
  requireConfig();
  log("info", "Bulletin cleanup worker starting", {
    intervalMinutes: INTERVAL_MINUTES,
    graceHours: GRACE_HOURS,
    runOnce: RUN_ONCE,
  });

  const server = startHealthServer();
  await purgeOnce();

  if (RUN_ONCE) {
    server?.close();
    process.exit(lastRun.ok ? 0 : 1);
  }

  const timer = setInterval(purgeOnce, INTERVAL_MINUTES * 60_000);

  const shutdown = (signal) => {
    log("info", "Shutting down", { signal });
    clearInterval(timer);
    server?.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main();
