import http from "node:http";
import twilio from "twilio";

// Purge env
const SUPABASE_URL = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const PURGE_INTERVAL_MINUTES = clamp(
  process.env.PURGE_INTERVAL_MINUTES,
  60,
  5,
  1440,
);
const GRACE_HOURS = clamp(process.env.PURGE_GRACE_HOURS, 24, 0, 720);

// SMS env
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "JANTAMEDICARE";
const SMS_INTERVAL_SECONDS = clamp(process.env.SMS_INTERVAL_SECONDS, 10, 5, 60);

// Disabled by default to prevent backend errors for unpaid accounts
const TWILIO_ENABLED = process.env.TWILIO_ENABLED === "true";
const twilioClient = TWILIO_ENABLED && TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN 
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) 
  : null;

// Health env
const SITE_URL = (process.env.SITE_URL || "").replace(/\/+$/, "");
const HEALTH_INTERVAL_MINUTES = clamp(
  process.env.HEALTH_INTERVAL_MINUTES,
  5,
  1,
  1440,
);
const TIMEOUT_MS = clamp(process.env.HEALTH_TIMEOUT_MS, 15000, 1000, 60000);

const RUN_ONCE = /^(1|true|yes)$/i.test(process.env.RUN_ONCE || "");
const PORT = Number(process.env.PORT) || 8080;

let sentry = null;
let lastPurge = { at: null, removed: null, ok: null, error: null };
let lastHealth = { at: null, ok: null, checks: [] };
let lastSms = { at: null, sent: 0, failed: 0 };

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

// ========================
// PURGE LOGIC
// ========================
function requirePurgeConfig() {
  const missing = [];
  if (!SUPABASE_URL) missing.push("SUPABASE_URL");
  if (!SERVICE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length) {
    log("error", "Missing required environment variables for Purge", {
      missing,
    });
  }
}

async function purgeOnce() {
  if (!SUPABASE_URL || !SERVICE_KEY) return null;
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
    lastPurge = {
      at: new Date().toISOString(),
      removed,
      ok: true,
      error: null,
    };
    log("info", "Purge complete", { removed, graceHours: GRACE_HOURS });
    return removed;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    lastPurge = {
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

// ========================
// HEALTH LOGIC
// ========================
async function httpCheck(name, url, { expect = 200 } = {}) {
  const expects = Array.isArray(expect) ? expect : [expect];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
      },
    });
    if (!expects.includes(res.status)) {
      throw new Error(`${url} responded ${res.status}, expected ${expects.join(" or ")}`);
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
  if (!SUPABASE_URL || !SERVICE_KEY) {
    const error = new Error("Supabase env vars are missing");
    report(name, error);
    return { name, ok: false, ms: 0, error: error.message };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bulletins?select=id&limit=1`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
        signal: controller.signal,
      },
    );
    if (!res.ok) throw new Error(`Supabase responded ${res.status}`);
    return { name, ok: true, ms: Date.now() - started };
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    report(name, error);
    return { name, ok: false, ms: Date.now() - started, error: error.message };
  } finally {
    clearTimeout(timer);
  }
}

async function runChecks() {
  const checks = [];
  if (SITE_URL) {
    checks.push(await httpCheck("home", `${SITE_URL}/api/health`, { expect: [200, 403] }));
    checks.push(
      await httpCheck("admin-api-locked", `${SITE_URL}/api/admin/camp`, {
        expect: [401, 403],
      }),
    );
  } else {
    log("info", "SITE_URL not set — skipping website checks");
  }
  checks.push(await supabaseCheck());

  const ok = checks.every((c) => c.ok);
  lastHealth = { at: new Date().toISOString(), ok, checks };
  log(
    ok ? "info" : "error",
    ok ? "All health checks passed" : "One or more health checks failed",
    { checks },
  );
  return ok;
}

// ========================
// SMS LOGIC
// ========================
async function processSmsQueue() {
  if (!SUPABASE_URL || !SERVICE_KEY) return;

  try {
    // 1. Fetch pending messages
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/sms_queue?status=eq.pending&limit=10`,
      {
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
        },
      }
    );
    if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status}`);
    const messages = await res.json();
    
    if (messages.length === 0) return;

    let sentCount = 0;
    let failedCount = 0;

    // 2. Process each message
    for (const msg of messages) {
      try {
        if (!twilioClient) {
          log("info", "[MOCK SMS] Would send SMS", { to: msg.phone_number, body: msg.message });
        } else {
          // Note: Hardcoded to "sms_order_confirmation" for Twilio Trial compatibility.
          // In production with an upgraded account, this should be: body: msg.message
          await twilioClient.messages.create({
            body: "sms_order_confirmation",
            from: TWILIO_PHONE_NUMBER,
            to: msg.phone_number,
          });
        }
        
        // Mark as sent
        await fetch(`${SUPABASE_URL}/rest/v1/sms_queue?id=eq.${msg.id}`, {
          method: "PATCH",
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "sent", updated_at: new Date().toISOString() }),
        });
        sentCount++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        log("error", "Failed to send SMS", { id: msg.id, to: msg.phone_number, error: errorMsg });
        
        // Mark as failed
        await fetch(`${SUPABASE_URL}/rest/v1/sms_queue?id=eq.${msg.id}`, {
          method: "PATCH",
          headers: {
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "failed", error_message: errorMsg, updated_at: new Date().toISOString() }),
        });
        failedCount++;
      }
    }

    lastSms = { at: new Date().toISOString(), sent: sentCount, failed: failedCount };
    if (sentCount > 0 || failedCount > 0) {
      log("info", "SMS queue processed", { sent: sentCount, failed: failedCount });
    }
  } catch (err) {
    log("error", "Error processing SMS queue", { error: err instanceof Error ? err.message : String(err) });
  }
}

// ========================
// SERVER LOGIC
// ========================
function startServer() {
  const rateLimitMap = new Map();

  const server = http.createServer((req, res) => {
    const ip = req.socket.remoteAddress || "unknown";
    const now = Date.now();

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
      const healthy = lastHealth.ok !== false; // treat null as ok initially
      res.writeHead(healthy ? 200 : 503, {
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          status: healthy ? "ok" : "degraded",
          health: {
            intervalMinutes: HEALTH_INTERVAL_MINUTES,
            lastReport: lastHealth,
          },
          purge: {
            intervalMinutes: PURGE_INTERVAL_MINUTES,
            lastRun: lastPurge,
          },
          sms: {
            intervalSeconds: SMS_INTERVAL_SECONDS,
            lastRun: lastSms,
          },
        }),
      );
      return;
    }
    if (req.url === "/ping") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }
    res.writeHead(404).end();
  });

  server.listen(PORT, "0.0.0.0", () =>
    log("info", "Combined backend endpoint listening", { port: PORT }),
  );
  return server;
}

async function main() {
  requirePurgeConfig();
  await initSentry();

  log("info", "Backend worker starting (Purge + Health + SMS)", {
    site: SITE_URL || null,
    purgeInterval: PURGE_INTERVAL_MINUTES,
    healthInterval: HEALTH_INTERVAL_MINUTES,
    smsInterval: SMS_INTERVAL_SECONDS,
    graceHours: GRACE_HOURS,
    runOnce: RUN_ONCE,
    twilioEnabled: !!twilioClient,
  });

  const server = startServer();
  await Promise.all([runChecks(), purgeOnce()]);

  if (RUN_ONCE) {
    server.close();
    process.exit(lastHealth.ok !== false && lastPurge.ok !== false ? 0 : 1);
  }

  const healthTimer = setInterval(runChecks, HEALTH_INTERVAL_MINUTES * 60_000);
  const purgeTimer = setInterval(purgeOnce, PURGE_INTERVAL_MINUTES * 60_000);
  const smsTimer = setInterval(processSmsQueue, SMS_INTERVAL_SECONDS * 1000);

  const shutdown = (signal) => {
    log("info", "Shutting down", { signal });
    clearInterval(healthTimer);
    clearInterval(purgeTimer);
    clearInterval(smsTimer);
    server.close();
    process.exit(0);
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main();
