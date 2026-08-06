/**
 * Smoke tests — no browser, no build required.
 *
 * Hits the running site over HTTP and asserts the contract every deploy must
 * satisfy: public pages render, the admin API is locked, the notices page
 * responds, and both locales work. Run against any environment:
 *
 *   SITE_URL=https://jantamedicare.pages.dev npm run test:smoke
 */

const BASE = (process.env.SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS) || 20000;

const results = [];

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ok   ${name}`);
  } catch (err) {
    results.push({ name, ok: false, error: err.message });
    console.error(`  FAIL ${name} — ${err.message}`);
  }
}

async function get(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${BASE}${path}`, {
      signal: controller.signal,
      redirect: "follow",
    });
  } finally {
    clearTimeout(timer);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function expectPage(path, needle) {
  const res = await get(path);
  assert(res.status === 200, `${path} responded ${res.status}`);
  const html = await res.text();
  assert(
    html.toLowerCase().includes(needle.toLowerCase()),
    `${path} is missing "${needle}"`,
  );
}

async function main() {
  console.log(`Smoke testing ${BASE}\n`);

  await check("home (en) renders", () => expectPage("/en", "Janta Medicare"));
  await check("home (hi) renders", () => expectPage("/hi", "Janta Medicare"));
  await check("medicines page renders", () =>
    expectPage("/en/medicines", "medicine"),
  );
  await check("packages page renders", () =>
    expectPage("/en/packages", "package"),
  );
  await check("rate chart renders", () =>
    expectPage("/en/patient-rate-chart", "rate"),
  );
  await check("locations page renders", () =>
    expectPage("/en/locations", "address"),
  );
  await check("doctors page renders", () =>
    expectPage("/en/doctors", "doctor"),
  );
  await check("notices page renders", () =>
    expectPage("/en/bulletins", "notice"),
  );

  await check("root redirects to a locale", async () => {
    const res = await get("/");
    assert(res.status === 200, `/ responded ${res.status}`);
    assert(
      /\/(en|hi)/.test(new URL(res.url).pathname),
      `/ did not land on a locale: ${res.url}`,
    );
  });

  await check("admin API rejects anonymous reads", async () => {
    const res = await get("/api/admin/camp");
    assert(
      res.status === 401,
      `/api/admin/camp responded ${res.status}, expected 401`,
    );
  });

  await check("admin packages API rejects anonymous reads", async () => {
    const res = await get("/api/admin/packages");
    assert(
      res.status === 401,
      `/api/admin/packages responded ${res.status}, expected 401`,
    );
  });

  await check("admin API rejects anonymous writes", async () => {
    const res = await fetch(`${BASE}/api/admin/bulletins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: "smoke test", kind: "info" }),
    });
    assert(
      res.status === 401,
      `POST /api/admin/bulletins responded ${res.status}, expected 401`,
    );
  });

  await check("unknown page returns 404", async () => {
    const res = await get("/en/this-page-does-not-exist");
    assert(res.status === 404, `unknown page responded ${res.status}`);
  });

  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n${results.length - failed.length}/${results.length} checks passed`,
  );
  if (failed.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
