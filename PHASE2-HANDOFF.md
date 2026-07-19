# Phase 2 Handoff — Neon + Clerk (v3.2)

**Status: code-complete on branch `phase2-neon-clerk`, NOT merged to `main`,
NOT deployed to production, and NOT yet runtime-tested.** Backing plan:
PLAN.md v3.2. Two payment rails (card via Stripe, ETH via Coinbase Commerce),
one idempotent credits ledger, all database access behind authenticated
`/api/*` routes. Auth is Clerk; database is Neon.

## Why this is on a branch, not main

Every earlier push this session went to `main`, which auto-deploys to the live
site. This rebuild can't be exercised without live Clerk/Neon/Stripe accounts,
and its first production code path (no env vars set = "unconfigured") is the
same white-screen class this repo broke on before (commits `c9a30b2`, and the
Supabase `createClient('')` throw). I could not headless-test locally (Chrome
extension wasn't connected), so I did not want to risk the working live site.
Push the branch → test the Vercel **preview** deploy → merge to main only once
it loads cleanly.

## What is DONE (both server and client, on the branch)

Typecheck (`tsc --noEmit`) and web build (`expo export -p web`) both pass.

**Server (`/api`):**
- `db/schema.sql` — Neon-adapted. `user_id` is now `text` (Clerk user id), no
  `auth.users` FK. All RLS / grants / `security_invoker` removed — there is no
  client-facing query surface anymore. `fulfill_purchase()` unchanged in logic
  (atomic + idempotent, keyed on `(processor, reference)`).
- `api/_lib/db.ts` — Neon serverless client (placeholder URL fallback so a
  missing `NEON_DATABASE_URL` fails at request time, not cold start).
- `api/_lib/auth.ts` — `getClerkUserId()`: verifies the Clerk session token via
  `@clerk/backend` `verifyToken`, returns `sub`.
- `api/_lib/fulfill.ts` — the single `fulfill_purchase()` call site (explicit
  `::type` casts on every param for the neon HTTP driver).
- `api/checkout.ts`, `api/eth-checkout.ts` — now Clerk-authenticated.
- `api/stripe-webhook.ts`, `api/coinbase-webhook.ts` — now write to Neon via
  `fulfillPurchase()`. Signature verification unchanged.
- `api/dashboard.ts` — **new.** Authenticated GET returning the caller's own
  balance + purchases + entitlements, filtered by verified `user_id`. This is
  the only path by which the client reads ledger data.
- `api/_lib/skus.ts`, `api/_lib/rawBody.ts` — unchanged (provider-agnostic).

**Client:**
- `hooks/useAuth.tsx` — thin wrapper over Clerk (`@clerk/clerk-expo`).
  Renders `ClerkProvider` only when a publishable key exists; otherwise a
  signed-out `UnconfiguredBridge`, so the app never crashes pre-provisioning.
- `components/SignInPanel.tsx` — Clerk email-code sign-in/sign-up flow.
- `services/api.ts` — `fetchDashboard()` + `createCheckout()` client helpers.
- `reserve.tsx`, `profile.tsx` (Dashboard), `course.tsx` — use the wrapper +
  `/api/dashboard`; no direct DB access.
- Removed: `services/supabase.ts`, `services/ledger.ts`, `api/_lib/supabase.ts`,
  `supabase/schema.sql`, and the `@supabase/supabase-js` dep. Added
  `@clerk/clerk-expo`, `@clerk/backend`, `@neondatabase/serverless`.

## NOT verified — confirm these on the preview deploy / first live test

1. **App loads with NO env vars set** (the unconfigured path). Highest
   priority — this is what production hits first. Should render every tab in a
   signed-out state with a "Sign-In Coming Soon" card.
2. **Clerk email-code flow** (`components/SignInPanel.tsx`). Follows Clerk's
   documented Expo pattern but was written without a live Clerk instance —
   the sign-in-vs-sign-up branching and `attemptFirstFactor`/
   `attemptEmailAddressVerification` calls need a real end-to-end run.
3. **Webhook raw body** on Vercel (`export const config = { api: { bodyParser: false } }`)
   — unchanged concern from the Supabase version.
4. **`/api/*` routing vs the SPA catch-all rewrite** in `vercel.json`.

## Owner provisioning checklist (all free / test-mode)

1. **Neon**: create a free project → run `db/schema.sql` (`psql "$NEON_DATABASE_URL" -f db/schema.sql`
   or the SQL editor) → copy the **pooled** connection string.
2. **Clerk**: create a free app, enable **Email verification code** as a
   sign-in/sign-up method → copy the Publishable key and Secret key.
3. **Stripe** (test mode): 4 Products/Prices matching `api/_lib/skus.ts`
   (course $99; credits $5 / $25 / $100) → webhook to `/api/stripe-webhook`
   for `checkout.session.completed` → copy secret + signing secret.
4. **Coinbase Commerce** (free): API key → webhook to `/api/coinbase-webhook`
   for `charge:confirmed` + `charge:resolved` → shared secret. Enable
   auto-conversion to USDC/fiat.
5. Set all env vars in **Vercel → Project → Environment Variables** (names in
   `.env.local.example`). `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is also needed at
   build time.

## Acceptance (both rails)

Sign in (email code) → buy on each rail → webhook fulfills → balance/entitlement
visible on the Dashboard (`/api/dashboard`). Then redeliver the webhook event
(Stripe/Coinbase resend) and confirm the balance does **not** change — proves
idempotency. Confirm no `/api` route exposes a DB connection string or lets one
user read another's rows.
