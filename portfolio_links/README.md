# Links

Link-in-bio page for `links.varadraut.dev`, with an authenticated admin area
to add/edit/remove/reorder the links shown.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public page,
and `/admin` to manage links (sign in at `/login`).

## Environment variables (`.env`)

| Variable | Purpose |
|---|---|
| `MONGO_URI` | Mongo connection string. Links live in the `links` collection; failed-login counters in `loginattempts`. |
| `JWT_SECRET` | Signs the admin session cookie. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` | Credentials for `/login`. The hash is bcrypt — generate one with `node -e "require('bcryptjs').hash('yourpassword', 10).then(console.log)"`. **Escape every `$` as `\$`** — Next.js does `$VAR`-style expansion on `.env` files, which otherwise corrupts a bcrypt hash. |

## Seeding

`npm run seed` upserts the starting set of links (LinkedIn, GitHub,
Instagram, LeetCode, email) defined in `scripts/seed.ts`. Re-running it is
safe — it matches on platform, not on document id.

## Admin

- `/login` — sign in with `ADMIN_USERNAME` / the plaintext password behind
  `ADMIN_PASSWORD_HASH`. Failed attempts are rate-limited per IP (5 per 10
  minutes, then a 15-minute lockout) — see `lib/rateLimit.ts`.
- `/admin` — add, edit, reorder, or remove links. Changes are reflected on
  the public page immediately (no caching — `revalidate = 0`).

## Logos

Platform icons come from `react-icons` (mostly Simple Icons, LinkedIn from
Font Awesome — see `lib/platforms.tsx` for why) rendered in each brand's
official color, not fetched from a live favicon/logo API. The public page is
a Server Component that queries Mongo directly and renders only the icons
for links that actually exist, so no unused logos or icon-library JS ever
reach the client — see `Decisions.md`.

## Stack notes

- Next.js 16 App Router (`proxy.ts` — the renamed `middleware.ts` — guards
  `/admin` and `/login`).
- Mongo/Mongoose for links + rate-limit counters.
- `jose` for the session JWT, `bcryptjs` for password hashing.
- `react-icons` + `lucide-react` for logos/UI icons.
