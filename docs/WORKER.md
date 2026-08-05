# Janta Medicare — Bulletin Cleanup Worker

A tiny standalone Node worker that deletes **expired offers** from the
`bulletins` table. It is intentionally dependency-free (uses `fetch` + the
Supabase REST API), so it starts in under a second and can be moved between
Railway projects in minutes.

> The website never depends on this worker for correctness: expired offers are
> already hidden by the row-level-security window on `bulletins`. The worker
> only reclaims storage.

## Files

| File           | Purpose                                                       |
| -------------- | ------------------------------------------------------------- |
| `index.mjs`    | The worker loop (`purge_expired_bulletins` RPC on a schedule) |
| `package.json` | Standalone package — not linked to the website build          |
| `.env.example` | Variables to copy into Railway                                |

## Deploy on Railway (free tier)

1. New Project → **Deploy from GitHub repo** → pick this repository.
2. Set **Root Directory** to `worker`.
3. Start command: `npm start` (already the default).
4. Add variables (Settings → Variables):

   ```
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=<service role key>
   PURGE_INTERVAL_MINUTES=60      # optional, default 60
   PURGE_GRACE_HOURS=24           # optional, keep expired offers 24h then delete
   RUN_ONCE=false                 # set true to use Railway cron instead of a loop
   ```

5. Deploy. The logs print one line per cycle.

## Swapping to a new Railway project each month

Because the worker keeps **zero local state**, swapping is safe at any moment:

1. Create the new Railway project with the same root directory and variables.
2. Wait for its first successful log line.
3. Delete (or pause) the old project.

Nothing is lost if both run at once — the delete is idempotent — and nothing
breaks if neither runs for a while, since expired offers are already invisible
on the site.

## Run locally

```bash
cd worker
cp .env.example .env      # fill in the values
npm start
```

Health check: the worker also serves `GET /healthz` on `PORT` (Railway sets it)
returning the last run summary as JSON.
