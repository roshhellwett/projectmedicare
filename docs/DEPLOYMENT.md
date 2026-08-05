# Janta Medicare — deployment

One repo, three deploy targets. Nothing is shared at runtime except Supabase.

```text
apps/frontend   → Cloudflare Workers (OpenNext)   public site + admin + /api/admin
apps/backend    → Railway service                 purges expired offers on a schedule
apps/health     → Railway service                 probes the site + Supabase, reports to Sentry
packages/shared → shared IST / validation / Supabase / error-code helpers
supabase/       → SQL migrations to run in the Supabase dashboard
tests/          → smoke (HTTP) + e2e (Playwright)
```

## 1. Supabase (once)

1. Create a free project.
2. SQL editor → run `supabase/migrations/0001_camp_and_bulletins.sql`.
3. Storage → new bucket `camp-images`, marked **Public**.
4. Copy the project URL, anon key and service role key.

## 2. Cloudflare — frontend

Settings:

- Build command: `npm run build:cf`
- Deploy command: `npx wrangler deploy` (or connect the repo and let Workers Builds deploy)
- Root directory: repository root (the workspace install pulls `packages/shared`)
- Worker config: `apps/frontend/wrangler.jsonc`

Variables (mark the last three **encrypted**):

| Variable                        |                                 |
| ------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | public                          |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public                          |
| `SUPABASE_SERVICE_ROLE_KEY`     | secret                          |
| `ADMIN_PASSWORD`                | secret                          |
| `ADMIN_SESSION_SECRET`          | secret — `openssl rand -hex 32` |

Local equivalent lives in `apps/frontend/.env.local` (see `.env.example`).

## 3. Railway — backend worker

- Root directory: repository root
- Config file: `apps/backend/railway.json` (or set the start command manually:
  `npm start --workspace @jm/backend`)
- Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, optional
  `PURGE_INTERVAL_MINUTES`, `PURGE_GRACE_HOURS`, `RUN_ONCE`, `SENTRY_DSN`

The worker keeps **no state**, so moving to a fresh Railway project each month is:
create new → confirm logs → delete old.

## 4. Railway — health checker

- Config file: `apps/health/railway.json`, health check path `/healthz`
- Variables: `SITE_URL` (the live Cloudflare URL), `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`, `SENTRY_DSN`, optional `HEALTH_INTERVAL_MINUTES`

It fails loudly if a public page breaks, if `/api/admin/*` ever stops returning
401 to anonymous callers, or if Supabase reads stop working.

## 5. Tests

```bash
npm run test:smoke                          # against localhost:3000
SITE_URL=https://your-site npm run test:smoke
npm run test:e2e:install --workspace @jm/tests
SITE_URL=https://your-site npm run test:e2e
```

## 6. Local development

```bash
npm install
npm run dev            # http://localhost:3000
npm run worker         # cleanup worker
npm run health         # health checker
npm run verify         # lint + typecheck + build
```
