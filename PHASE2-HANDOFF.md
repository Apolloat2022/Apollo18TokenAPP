# Phase 2 Handoff — backend (Opus) and client (Sonnet) both done

**Status: Phase 2a + 2b both committed and pushed (`ccacb15`, `34b20f1`).
Code-complete but UNTESTED — nothing has run against a real Supabase/Stripe/
Coinbase account yet. Owner provisioning (checklist below) is the remaining
blocker before this can be exercised end-to-end.**

Status as of 2026-07-18. Backing plan: PLAN.md v3.1. Two payment rails: card
(Stripe) and ETH (Coinbase Commerce), both at USD prices, both fulfilling
through one idempotent ledger.

## What is DONE (Phase 2a — server, correctness core)

All committed, typechecks + web build pass. **Dormant until env vars exist** —
nothing in the app calls these endpoints yet, so deploying is safe.

- `supabase/schema.sql` — run once in the Supabase SQL editor. Append-only
  `ledger_entries` (balance = `SUM(delta)` via the `credit_balances` view),
  `purchases`, `entitlements`, RLS (read-own-rows only; all writes via
  service-role), and `fulfill_purchase()` — an atomic, idempotent SQL function
  keyed on `(processor, reference)`.
- `api/checkout.ts` — Stripe Checkout Session. Auth from the caller's Supabase
  JWT; amount owned by the Stripe Price.
- `api/stripe-webhook.ts` — verifies signature over raw body, fulfills on
  `checkout.session.completed`.
- `api/eth-checkout.ts` — Coinbase Commerce hosted charge (USD price → ETH at
  pay time). No wallet code in the app.
- `api/coinbase-webhook.ts` — verifies `X-CC-Webhook-Signature` HMAC, fulfills
  on `charge:confirmed` / `charge:resolved`.
- `api/_lib/` — `skus.ts` (server SKU→price/credits map; keep in sync with
  `data/catalog.ts`), `supabase.ts` (service-role client + JWT verify),
  `rawBody.ts`.
- `.env.local.example` — every var the endpoints read.

Idempotency design (the point of doing this on Opus): keyed on the PURCHASE
identity (Stripe session id / Coinbase charge id), not the event id, because
Coinbase emits multiple events per charge. First fulfillment wins; every later
call is a no-op. Same guarantee for Stripe redeliveries.

## What is DONE (Phase 2b — client)

1. **Supabase client + auth context**: `services/supabase.ts` (reads
   `supabaseUrl`/`supabaseAnonKey` from `expo-constants`; falls back to a
   placeholder so the app doesn't crash before Supabase is provisioned) +
   `hooks/useAuth.tsx` (magic-link sign-in/out, session, access token),
   wrapped around the app in `app/_layout.tsx`.
2. **Checkout wired**: `app/(tabs)/reserve.tsx` now signs the user in first,
   then `POST`s `/api/checkout` (card) or `/api/eth-checkout` (ETH) with
   `Authorization: Bearer <token>` + `{ sku }`, and redirects to the returned
   `url`. Replaced the old simulated `setTimeout` payment entirely.
3. **Dashboard tab**: `profile.tsx` renamed to Dashboard (`app/_layout.tsx`
   tab label), rebuilt to show real balance + purchase history via
   `services/ledger.ts`, sign-in/out, and `?checkout=success` handling. Also
   removed the last of the old crypto/SEC-CFTC/contract-address copy that had
   survived Phase 0/1 in this specific file.
4. **Course gating**: `app/(tabs)/course.tsx` queries real `entitlements` via
   `services/ledger.ts` instead of a hardcoded mock; shows a sign-in hint when
   logged out.
5. **Redirect params**: both `?checkout=success` (Dashboard) and
   `?checkout=cancelled` (Pricing) are handled.

Two issues found and fixed while wiring the client (both in the commit):
- **Schema security fix**: `credit_balances` was a plain view, which
  Postgres runs with the *owner's* privileges by default — bypassing RLS on
  `ledger_entries` and letting any signed-in user read every user's balance.
  Added `security_invoker = true` + explicit `authenticated`-only grants.
  **If you already ran the old `schema.sql` in a live Supabase project,
  re-run the updated file** (or just `create or replace view` the fixed
  block) before relying on the balance view.
- **White-screen crash fix**: `createClient()` throws synchronously on an
  empty Supabase URL, which would have crashed the entire app on load before
  Supabase is set up (this repo hit exactly this failure mode before —
  commit `c9a30b2`). Now falls back to a placeholder so the app renders; only
  auth/checkout/dashboard features fail gracefully until real keys are set.

## Owner provisioning checklist (before 2b can be TESTED)

All free / test-mode. None block writing 2b code, only testing it.

1. **Supabase**: create a free project → run `supabase/schema.sql` in the SQL
   editor → copy Project URL, `anon` key, `service_role` key. Enable Email auth
   (magic link) under Authentication → Providers.
2. **Stripe** (test mode): create 4 Products/Prices matching the SKUs in
   `api/_lib/skus.ts` (course $99; credits $5 / $25 / $100) → copy each
   `price_...` id → get the secret key → add a webhook endpoint pointing at
   `/api/stripe-webhook` for `checkout.session.completed` → copy its signing
   secret.
3. **Coinbase Commerce** (free): create account → API key → add a webhook
   pointing at `/api/coinbase-webhook`, subscribe to `charge:confirmed` and
   `charge:resolved` → copy the shared secret. Enable auto-conversion to
   USDC/fiat to avoid holding volatile ETH.
4. Put all values in **Vercel → Project → Environment Variables** (see
   `.env.local.example` for names). The `EXPO_PUBLIC_*` ones are also needed at
   build time for the client.

## Acceptance (both rails)

Test-mode purchase end-to-end: sign in → buy → webhook fulfills → balance/
entitlement visible on Dashboard. Then redeliver the webhook event (Stripe CLI
`stripe trigger` / resend; Coinbase resend) and confirm the balance does **not**
change — proves idempotency.

## Two environment risks to verify on the FIRST live deploy

Both are Vercel-runtime behaviors that can't be confirmed locally:

1. **Raw webhook body**: both webhooks set `export const config = { api: { bodyParser: false } }`
   and read the stream. If Vercel still parses the body on this runtime, the
   signature check fails — confirm with a test event before trusting it.
2. **`/api/*` routing vs the SPA rewrite**: `vercel.json` has a catch-all
   rewrite to `/`. Vercel should match `/api` functions first, but verify
   `/api/checkout` actually hits the function (not the SPA) once deployed.
