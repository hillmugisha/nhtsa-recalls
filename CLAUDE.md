# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

Next.js 16.2.4 + React 19.2.4 + TypeScript (strict) + Tailwind v4 + Supabase. Path alias `@/*` → repo root. The `AGENTS.md` warning is load-bearing — Next 16 has breaking changes from earlier versions, including the rename of `middleware.ts` → `proxy.ts` (see [proxy.ts](proxy.ts)). Consult `node_modules/next/dist/docs/` before assuming framework conventions.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` / `npm start` — production build & serve
- `npx tsx scripts/sync-recalls.ts` — full NHTSA → Supabase sync (logs progress; filters to allowlist of makes; idempotent upsert on `campno,model_year`)
- `npx tsx scripts/cleanup-makes.ts` — delete recalls whose `make` is outside the allowlist
- `npx tsx scripts/normalize-casing.ts` — re-title-case existing `make`/`model` rows

There is no test runner or linter configured. Scripts auto-load `.env.local` via `dotenv`.

## Environment

`.env.local` must define `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `AUTH_SECRET`. The anon key is used for read endpoints; the service-role key is used only for writes (`/api/sync`, login user-row updates) and must never reach the client.

## Architecture

**Route groups.** [app/(app)](app/(app)/) is the authenticated UI shell (header/sidebar/table). [app/(auth)](app/(auth)/) holds `/login` and `/unauthorized` and has its own layout with no chrome. The proxy middleware redirects unauthenticated requests to `/login` for everything outside those groups and `/api/auth/*`.

**Auth.** Custom HMAC-signed cookie sessions, not Supabase Auth. Flow:
1. `POST /api/auth/login` validates `@pritchards.com` email, looks up the user in the `users` table, requires `access_granted=true`, then issues an HMAC-SHA256 cookie via [lib/session.ts](lib/session.ts).
2. [proxy.ts](proxy.ts) verifies the cookie on every non-public request and clears it on tamper.
3. `GET /api/auth/me` returns the current email; client components use it for UI state.

The signed value is just `base64(email).hmac(email)` — there is no expiry inside the token; the cookie's `maxAge` (8h) is the only TTL.

**Data layer.** Single `recalls` table in Supabase keyed by `(campno, model_year)`. Schema in [supabase/migrations/](supabase/migrations/). `users` table gates access (admin manually sets `access_granted`). The app talks to Supabase directly from API routes — no ORM, no repository layer.

**NHTSA sync.** [lib/nhtsa.ts](lib/nhtsa.ts) wraps `api.nhtsa.gov` with a 150 ms throttle and silent error fallback (returns `[]`). The sync logic lives in **two places**: [scripts/sync-recalls.ts](scripts/sync-recalls.ts) (CLI, filtered to an allowlist of ~10 makes, verbose logging) and [app/api/sync/route.ts](app/api/sync/route.ts) (HTTP `POST`, **no** make filter, silent failures). The `mapRecall` / `parseDate` / `toTitleCase` helpers are duplicated between them — keep both copies in sync when changing field mapping. NHTSA dates arrive as `YYYYMMDDT000000`; `parseDate` normalizes to ISO `YYYY-MM-DD`.

**Filters endpoint.** [app/api/filters/route.ts](app/api/filters/route.ts) returns `{ years, makes, models }` with cascading filter behavior: passing `modelYear` narrows `makes`; passing `modelYear`+`make` narrows `models`. `years` is always the full list. Distinct values are computed in JS via `Set`, not via SQL.

**Recalls list.** [app/api/recalls/route.ts](app/api/recalls/route.ts) paginates 50/page ordered by `report_received_date desc`, with `ilike` matching for `make`/`model`. The home page is a client component that owns filter state and re-fetches on every change.

**Layout quirk.** Root [layout.tsx](app/layout.tsx) sets `h-full` on `<html>`/`<body>`; the `(app)` layout uses `min-w-max` to force horizontal scroll rather than wrapping the table. Don't remove these without understanding the full-height + wide-table interaction.
