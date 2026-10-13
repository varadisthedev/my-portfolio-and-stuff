# Decisions

Running log of major decisions. Newest first.

## 2026-08-31 — Selectable auto-refresh interval

- **Poll interval (5m/10m/20m/1h/3h) is user-selectable and stored in `localStorage`**,
  same pattern as sort. Default stays 5m, matching the Render cron's check cadence.
- **The timer POSTs to the public `/api/refresh` endpoint**, the same one the manual
  Refresh button uses, so it actually re-checks every service instead of just
  re-reading whatever the DB already has — and as a side effect keeps pinging the
  Render instance often enough to stop its free tier from sleeping. Failures (e.g.
  hitting the endpoint's own rate limit) are swallowed silently; it's a convenience,
  not the only path to fresh data. 10m was added as an option specifically for this
  keep-awake use case, comfortably under Render's ~15min free-tier sleep timeout.

## 2026-08-26 — Uptime bar, manual refresh, sorting

- **Uptime bar draws one slice per run of checks, not one colour per day.** Consecutive
  checks with the same status collapse into a segment; a status change mid-day adds a
  second slice inside that day's column instead of recolouring it. Slices are equal-width
  within a day (not time-proportional) so a single new check stays visible.
- **Capped at 6 slices per day.** A flapping service would otherwise shred a ~18px column
  into unreadable slivers. Past the cap the smallest run merges into its smaller
  neighbour, and the merged slice takes its tone from the combined uptime %.
- **Day keys are formatted in local time.** The old code bucketed by local midnight but
  labelled with `toISOString()`, so every day was labelled one off in any timezone behind
  UTC (e.g. IST).
- **"Refreshed Ns ago" now reads the newest check in the database.** It used to count
  seconds since the component mounted, which looked live even when no check had run in
  days.
- **Checks older than `STALE_AFTER_MINUTES` (default 30) are marked stale.** The badge
  greys out with a "Stale" chip; a card showing "Down" from a three-day-old check was
  presenting history as a live reading.
- **Manual refresh is rate limited in Mongo, not in memory.** A TTL-indexed fixed-window
  counter survives serverless instance churn, which an in-process `Map` does not. Limits:
  5 per IP per 10 min, plus a 15s global cooldown so concurrent visitors can't double-ping
  every monitored service. Client IP comes from `x-forwarded-for` — spoofable, so this
  throttles honest traffic rather than defending against a determined attacker.
- **Sort lives in `localStorage` via `useSyncExternalStore`.** Keeps the choice across the
  dashboard's 60s auto-refresh without a hydration mismatch. Options: working first (default),
  down first, name A–Z.
- **Locale-formatted times are gated behind `useIsClient()`.** Tooltips and timestamps
  render in the viewer's locale/timezone; server-rendering them mismatched on hydration
  and left the server's timezone baked into the DOM.
- **`MONGO_URI` is checked inside `connectToMongo()`, not at module load.** `next build`
  imports route modules to collect page data, and CI (Cloudflare) has no runtime secrets
  then — the top-level throw failed the build on `/api/cron/check`.
- **Next 16.4.0 (was 16.2.7).** `@opennextjs/cloudflare` requires `next >=16.3.8`.
  `react-dom` pinned exact to `19.2.4` to match `react`; its `^` range had drifted to 19.3.0.
- **Worker named `portfolio-status` (was `global-status`).** Must match the Cloudflare
  Workers Builds project name; the `WORKER_SELF_REFERENCE` service binding uses the same name.
- **Workers observability: logs + issues on, traces off.** Logs persist with invocation
  logs at 100% sampling; top-level `enabled` stays false so only the explicit sub-configs apply.
- **Next pinned to 16.3.8 (was 16.4.0).** 16.4.0 loads a new `server/preview-props.json` that
  OpenNext 1.20.11 doesn't inline, so the worker threw on init and every request 500'd.
  Revisit when OpenNext supports it.
- **Custom domain declared in `wrangler.jsonc` routes.** Deploys override dashboard-only
  config; declaring `status.varadraut.dev` keeps it from being dropped.
