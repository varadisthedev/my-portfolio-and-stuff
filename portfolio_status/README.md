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

## Scheduling health checks

Checks aren't run on page load — they're written to Mongo by
`/api/cron/check` so the dashboard has real history to chart. Point an
external scheduler (e.g. [cron-job.org](https://cron-job.org), free tier) at:

```
GET https://<your-deployment>/api/cron/check?secret=<CRON_SECRET>
```

every 5 minutes or so. Each check is kept for 30 days (TTL index), which
backs the 24h/7d/30d uptime stats, the latency sparkline, and the 45-day
uptime bar per domain.

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
- `recharts` for the latency chart; the day-by-day uptime bar is hand-rolled.
- `next-themes` for the light/dark toggle (`data-theme` attribute, tokens in
  `app/globals.css`).
