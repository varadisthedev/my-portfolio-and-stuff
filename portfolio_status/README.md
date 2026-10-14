# Status

Live uptime and latency dashboard for your services, with an authenticated
admin area to add/edit/remove monitored domains.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public dashboard,
and `/admin` to manage domains (sign in at `/login`).

## Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `MONGO_URI` | Mongo connection string. Domains and check history live in the `domains` / `statuschecks` collections. |
| `JWT_SECRET` | Signs the admin session cookie. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` | Credentials for `/login`. The hash is bcrypt — generate a new one with `node -e "require('bcryptjs').hash('yourpassword', 10).then(console.log)"`. **Escape every `$` as `\$`** — Next.js does `$VAR`-style expansion on `.env` files, which otherwise corrupts a bcrypt hash. |
| `CRON_SECRET` | Required to call `GET/POST /api/cron/check` (via `x-cron-secret` header, `Authorization: Bearer <secret>`, or `?secret=`). |
| `STALE_AFTER_MINUTES` | Optional (default `45`). How old the newest check may get before a service is flagged **Stale** — the badge stops claiming to be a live reading. |

## Deploying (Vercel)

Import the repo in Vercel with the root directory set to `portfolio_status`; the Next.js
preset needs no extra config. Add the environment variables above under
Settings → Environment Variables, then point your domain at the project. Vercel
Hobby cron only runs once a day, so keep the external scheduler below.

## Scheduling health checks

Checks aren't run on page load — they're written to Mongo by
`/api/cron/check` so the dashboard has real history to chart. Point an
external scheduler (e.g. [cron-job.org](https://cron-job.org), free tier) at:

```
GET https://<your-deployment>/api/cron/check?secret=<CRON_SECRET>
```

every 30 minutes. Each check is kept for 30 days (TTL index), which
backs the 24h/7d/30d uptime stats, the latency sparkline, and the 45-day
uptime bar per domain.

**Without a scheduler the bar is grey.** Grey means "no check ran that day" —
not "up" and not "down". Days only get colour once checks exist for them, and
history can't be backfilled.

## Manual refresh

The dashboard's **Refresh** button posts to `/api/refresh`, which runs the same
checks as the cron route and writes them to Mongo. No secret is needed, so it's
rate limited instead (signed-in admins skip both limits):

- **10 refreshes per IP per 5 minutes** (client IP read from `x-real-ip`, which
  Vercel sets and clients can't spoof).
- **15s global cooldown**, so several visitors clicking at once can't pile
  requests onto the monitored services.

Both counters are fixed windows stored in the `ratelimits` collection with a TTL
index, so they hold up across serverless instances. Over-limit requests get a
`429` with `retryAfterSeconds`, which the button shows as a countdown.

## Reading the uptime bar

Each day is one column, and each column is split into one slice per *run* of
checks. Consecutive checks that agree share a slice, so a service that goes
degraded and then recovers on the same day shows two slices in that column
rather than a single averaged colour — a new check adds to the day, it never
replaces it. Days that flap a lot cap out at six slices, with the smallest runs
merged. Hover any slice for its time range, uptime %, and check count.

## Admin

- `/login` — sign in with `ADMIN_USERNAME` / the plaintext password behind
  `ADMIN_PASSWORD_HASH`.
- `/admin` — add, rename/re-URL, or remove monitored domains. Changes are
  reflected on the public dashboard immediately (deleting a domain also
  drops its check history).

## Stack notes

- Next.js 16 App Router (`proxy.ts` — the renamed `middleware.ts` — guards
  `/admin`).
- Mongo/Mongoose for domains + check history.
- `jose` for the session JWT, `bcryptjs` for password hashing.
- `recharts` for the latency charts (per-service sparkline, plus the sticky
  all-services panel with 24h/7d/30d ranges, p95 and per-service averages); the day-by-day uptime bar is hand-rolled.
- Services can be sorted by working-first, down-first, or name; the choice is
  kept in `localStorage`.
- `next-themes` for the light/dark toggle (`data-theme` attribute, tokens in
  `app/globals.css`).
