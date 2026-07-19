# Phase 2 Handoff — backend done (Opus), client next (Sonnet)

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

## What is NEXT (Phase 2b — client, good Sonnet task)

1. **Supabase client + auth context** (`services/supabase.ts` + a provider):
   read `supabaseUrl` / `supabaseAnonKey` from `expo-constants`
   (`Constants.expoConfig.extra`, already wired in `app.config.js`). Email
   magic-link sign-in. Expose the session's access token.
2. **Wire checkout**: in `app/(tabs)/reserve.tsx`, replace the simulated
   `proceedToPayment` (the `setTimeout` + `googleSheetsService` call) with a
   `POST` to `/api/checkout` (card) or `/api/eth-checkout` (ETH), sending
   `Authorization: Bearer <token>` and `{ sku }`, then redirect the browser to
   the returned `url`. Add a "Pay by card" / "Pay with ETH" choice per item.
3. **Dashboard tab** (rename `profile.tsx` → Dashboard in `app/_layout.tsx`):
   show credit balance (`credit_balances` view), purchase history
   (`purchases`), and a "buy more" link to Pricing. Requires sign-in.
4. **Course gating**: in `app/(tabs)/course.tsx`, replace the mock `ownedSkus`
   with a real query of `entitlements` for the signed-in user.
5. **Handle redirect params**: `/profile?checkout=success` and
   `/reserve?checkout=cancelled` (set by both checkout endpoints).

Note: sign-in must exist before checkout works — the endpoints 401 without a
valid Supabase token. Build auth (step 1) first.

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
