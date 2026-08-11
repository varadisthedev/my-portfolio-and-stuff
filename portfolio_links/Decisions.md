# Decisions

Log of the non-obvious calls made while building this app, and why.

## Stack: mirrored `portfolio_status`, not a fresh scaffold

Rather than `create-next-app` from scratch, this app copies the config
(`tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `.gitignore`),
the auth pattern (`jose` JWT cookie + `bcryptjs`, `proxy.ts` guarding
protected routes), and the Mongo connection-caching pattern from the sibling
`portfolio_status` app. Same monorepo, same conventions, one less stack to
context-switch between when maintaining both.

One deliberate deviation: `next`/`eslint-config-next` are pinned to `16.3.0`
instead of matching `portfolio_status`'s `16.2.7` — `16.2.7` carries several
disclosed high-severity advisories (proxy bypass, SSRF, DoS) that `16.3.0`
fixes, and this is a fresh install with no reason to inherit that exposure.

## Logos: bundled `react-icons` (Simple Icons), not a live favicon/logo API

Considered fetching logos live (Clearbit's old logo API, Google's favicon
service, etc.) so "official logo" always meant "whatever the platform ships
today." Went with `react-icons/si` (Simple Icons) instead, bundled at build
time:

- No runtime dependency on a third-party image service staying up, free, or
  unrate-limited — this page has one job and shouldn't 502 because a favicon
  CDN did.
- Favicon services return inconsistently cropped, sometimes stale or
  low-res icons; Simple Icons are vector, consistently padded, and already
  "cropped clean."
- Every icon renders in its actual brand color (hand-set per platform in
  `lib/platforms.tsx`, since this version of `react-icons` doesn't attach
  color metadata to the components) rather than a fetched raster favicon.

Trade-off accepted: new platforms need a code change (add to
`lib/platforms.tsx`) instead of working automatically. For a personal
link-in-bio with a fixed, small set of platforms, that's the right side of
the trade.

One exception: **LinkedIn**. Simple Icons no longer ships LinkedIn's mark
(pulled after a takedown request), so that one icon comes from
`react-icons/fa6` (Font Awesome) instead.

Email and a generic "website" entry aren't brand logos at all — they use
plain `lucide-react` icons (envelope / globe), since there's no single
"official" mark for an email address.

## "Only send logos actually in use" → server-rendered icons, not a client bundle

The public page (`app/page.tsx`) is a Server Component that queries Mongo
directly and renders `<LinkRow>` (also a Server Component) per link. Neither
does anything client-side, so the icon SVGs are emitted as static markup in
the HTML response — the browser never downloads icon-library JS for
platforms that aren't configured, or even for the ones that are (they're
inline `<svg>`, not a JS-rendered icon component). This satisfies "new
visitor only gets the logos currently on the page" more literally than
filtering an API response would: there's no icon *data* sent beyond the SVG
paths already needed to draw what's visible.

`lib/platforms.tsx` still exports the full catalog (~26 platforms) for the
admin dropdown — that page is behind auth, so shipping the full picker there
isn't a concern.

## Rate limiting: Mongo-backed fixed window, not in-memory or Redis

`portfolio_status` has `REDIS_URL` wired up for future use, which would've
been the more conventional choice for a login rate limiter. Went with a
Mongo collection (`lib/rateLimit.ts`, `LoginAttempt` model) instead, to
avoid adding a second infra dependency (and its own uptime/connection
concerns) to an app whose entire job is showing a handful of links reliably.
Mongo is already required for the link data, so the limiter piggybacks on
that connection.

Design: 5 failed attempts per IP in a 10-minute window triggers a 15-minute
lockout. A TTL index (`expiresAt`) self-cleans old records — no cron needed.
An in-memory counter was ruled out outright: serverless functions don't
share memory across invocations/instances, so it wouldn't actually limit
anything under real deployment.

Limiting is per-IP, not per-username — there's exactly one admin account, so
a username dimension adds nothing.

## Admin reordering: up/down buttons, not drag-and-drop

`AdminLinksManager` reorders via arrow buttons that swap adjacent `order`
values (persisted through `POST /api/links/reorder`), instead of a
drag-and-drop library (`@dnd-kit`, etc.). For a list that's realistically
under a dozen items, drag-and-drop is a dependency and a11y surface this
app doesn't need yet. Noted as a candidate upgrade if the link list grows.

## Visual design: CRT/terminal aesthetic, adapted from the reference image

The reference screenshot (a Carrd profile card) is monochrome-green,
monospace, window-chrome-topped, with scanline texture. Borrowed the palette,
font (`JetBrains Mono`), window-chrome header (date/time pills + dots), and
boxed-panel styling. Didn't borrow the multi-panel social-profile layout
(About Me / Favs / Don't Interact) — this is a links page, not a profile
clone, so it's one identity block plus one links panel, with the panel
pinned toward the bottom of the page per the brief ("all in one place in
bottom of the page").

Icon chips stay on the dark theme's surface color rather than a light
"badge" background — most brand colors read fine on dark; the handful that
don't (GitHub, X, TikTok, Threads, Medium, Dev.to — all near-black marks)
are set to a light green-white in `lib/platforms.tsx` instead, mirroring
those platforms' own dark-mode/white logo variants rather than inventing a
new light-chip pattern that would clash with the CRT theme.

The admin login entry point is a small `Lock` icon next to the "links . . ."
label, not a visible button — per the brief ("small login option").
