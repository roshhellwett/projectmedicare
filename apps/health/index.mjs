/**
 * Janta Medicare — health checker (Railway).
 *
 * Probes the public site, the admin API surface and Supabase on a schedule.
 * Failures are logged as JSON and, when SENTRY_DSN is set, reported to Sentry
 * so we hear about an outage before a customer calls the shop.
 *
 * Stateless by design: it can be deleted and re-created on a new Railway
 * project at any time with no migration.
 */

import http from "node:http";
import { createPublicClient } from "@jm/shared/supabase";

const SITE_URL = (process.env.SITE_URL || "").replace(/\/+$/, "");
const INTERVAL_MINUTES = clamp(process.env.HEALTH_INTERVAL_MINUTES, 5, 1, 1440);
const TIMEOUT_MS = clamp(process.env.HEALTH_TIMEOUT_MS, 15000, 1000, 60000);
const PORT = Number(process.env.PORT) || 8080;

let sentry = null;
let lastReport = { at: null, ok: null, checks: [] };

function clamp(raw, fallback, min, max) {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function log(level, message, extra = {}) {
  const line = { ts: new Date().toISOString(), level, message, ...extra };
  console[level === "error" ? "error" : "log"](JSON.stringify(line));
}

async function initSentry() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    log("info", "SENTRY_DSN not set — failures will only be logged");
    return;
  }
  try {
    const mod = await import("@sentry/node");
    mod.init({
      dsn,
      environment: process.env.SENTRY_ENVIRONMENT || "production",
      tracesSampleRate: 0,
    });
    sentry = mod;
    log("info", "Sentry initialised");
  } catch (err) {
    log("error", "Sentry could not be initialised", { error: String(err) });
  }
}

function report(name, error) {
  log("error", `Check failed: ${name}`, { error: error.message });
  sentry?.captureException(error, { tags: { check: name } });
}

async function httpCheck(name, url, { expect = 200 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
    });
    if (res.status !== expect) {
      throw new Error(`${url} responded ${res.status}, expected ${expect}`);
    }
    return { name, ok: true, ms: Date.now() - started };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    report(name, error);
    return { name, ok: false, ms: Date.now() - started, error: error.message };
  } finally {
    clearTimeout(timer);
  }
}

async function supabaseCheck() {
  const name = "supabase";
  const started = Date.now();
  const client = createPublicClient();
  if (!client) {
    const error = new Error(
      "Supabase env vars are missing in the health checker",
    );
    report(name, error);
    return { name, ok: false, ms: 0, error: error.message };
  }
  const { error } = await client
    .from("bulletins")
    .select("id", { head: true, count: "exact" });
  if (error) {
    report(name, new Error(`Supabase read failed: ${error.message}`));
    return { name, ok: false, ms: Date.now() - started, error: error.message };
  }
  return { name, ok: true, ms: Date.now() - started };
}

async function runChecks() {
  const checks = [];

  if (SITE_URL) {
    checks.push(await httpCheck("home", `${SITE_URL}/en`));
    checks.push(await httpCheck("bulletins", `${SITE_URL}/en/bulletins`));
    // Unauthenticated admin API must stay locked.
    checks.push(
      await httpCheck("admin-api-locked", `${SITE_URL}/api/admin/camp`, {
        expect: 401,
      }),
    );
  } else {
    log("info", "SITE_URL not set — skipping website checks");
  }

  checks.push(await supabaseCheck());

  const ok = checks.every((c) => c.ok);
  lastReport = { at: new Date().toISOString(), ok, checks };
  log(
    ok ? "info" : "error",
    ok ? "All checks passed" : "One or more checks failed",
    { checks },
  );
  return ok;
}

function startServer() {
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
      const healthy = lastReport.ok !== false;
      res.writeHead(healthy ? 200 : 503, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({ status: healthy ? "ok" : "degraded", lastReport }),
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
  await initSentry();
  log("info", "Health checker starting", {
    site: SITE_URL || null,
    intervalMinutes: INTERVAL_MINUTES,
  });

  const server = startServer();
  await runChecks();

  if (/^(1|true|yes)$/i.test(process.env.RUN_ONCE || "")) {
    server.close();
    process.exit(lastReport.ok ? 0 : 1);
  }

  const timer = setInterval(runChecks, INTERVAL_MINUTES * 60_000);
  const shutdown = (signal) => {
    log("info", "Shutting down", { signal });
    clearInterval(timer);
    server.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main();
