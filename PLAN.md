# Apollo18 Pivot Plan: From Crypto Token to AI Usage Credits

**Version 3.0 — July 2026. Supersedes the "Digital Tool Transition" roadmap (v2.1).**

Apollo18 stops being a crypto token. "Tokenization for AI usage" now means **Apollo18 Credits**: a prepaid, off-chain, ledger-based unit that customers buy with USD and spend on AI-powered features (course AI tutor, prompt playground, agent runs) and, later, on metered API access. No blockchain, no wallets, no securities-law exposure.

This document is a build plan for hand-off. **Do not treat the current codebase's compliance claims (SEC/CFTC 2026 Interpretation, Texas 20% exemption) as verified facts — see "Compliance & Legal" below.**

---

## 1. Options Explored

### Option A — In-house prepaid credits ledger (RECOMMENDED)
- Stripe Checkout sells credit packs; a Stripe webhook credits an append-only ledger (Postgres/Supabase).
- Every AI call flows through a thin gateway that debits credits based on actual model token usage plus margin.
- Convention: **1 credit = $0.01** (the emerging 2026 industry standard), so pricing reads naturally ("this run cost 12 credits").
- Why: full control, minimal vendor lock-in, tiny surface area, fits the current scale (pre-revenue, single product). Everything runs on the existing Vercel deployment plus Supabase's free tier.

### Option B — Managed usage-based billing platform
- Stripe Billing Meters (Metronome is now part of Stripe), Orb, Lago (open-source), Flexprice, OpenMeter.
- Why not now: these earn their keep with invoicing, plan matrices, and enterprise contracts. Apollo18 has one product and prepaid-only sales. Adopt later if/when developer API invoicing gets real. The ledger schema in Option A is designed so usage events can be exported to any of these later.

### Option C — Keep an on-chain token as a "receipt" layer
- **Rejected.** It re-imports every regulatory question the pivot is meant to eliminate, contradicts the new positioning, and adds zero user value. All WalletConnect/ethers code should be deleted, not preserved.

---

## 2. Product Definition (what Apollo18 sells after the pivot)

Apollo18 is a **platform, not a single course**: one credits balance and one checkout that any Apollo product can sell through. The catalog (courses + credit packs) lives in `data/catalog.ts` as SKU entries that map 1:1 to Stripe products in Phase 2 — the prompt-engineering course is just the first entry, not the product.

| Offering | Model |
|---|---|
| Course catalog (Prompt Engineering Mastery first; more portfolio courses later) | One-time USD purchase per course SKU (Stripe Checkout) → unlocks that course in the portal |
| Apollo18 Credits | Prepaid packs (500 / 2,500 / 10,000 credits) |
| AI Tutor & Prompt Playground | Spends credits per interaction (metered on real model tokens) |
| Metered AI tools from other portfolio apps | Same ledger + gateway (e.g., pdf-audiobook-converter conversions, course student runs) |
| Developer API keys (Phase 4) | Credits spent programmatically via Apollo18 gateway |

Cross-app integration paths (both already implied by §3's architecture):
- **Shared account (Phase 2)**: other apps authenticate against the same Supabase project, so one credit balance spends across the whole portfolio.
- **Per-app API keys (Phase 4)**: existing apps — including the Python ones — call the Apollo18 gateway with their own key, without adopting its auth stack.

Candidate first integrations from `C:\Projects\APPS`: **PromptCraft Pro** (root app — richest existing course content, could supply the real curriculum), **agentic-ai-course** (second catalog course; rotate its leaked GitHub credentials first — see APPS/HANDOFF.md), **AI-agentic-loop** (students spend Apollo18 credits through the gateway instead of bringing their own API key), **pdf-audiobook-converter** (per-conversion credit metering).

The word "token" survives only in the AI sense (model tokens). All customer-facing currency language is "credits."

---

## 3. Target Architecture

```
Expo/RN Web (Vercel)                 Serverless API (Vercel functions /api)
┌──────────────────┐   HTTPS   ┌──────────────────────────────────────┐
│ Home / Pricing   │──────────▶│ /api/checkout  → Stripe Checkout      │
│ Course + Tutor   │           │ /api/stripe-webhook → credit ledger   │
│ Dashboard        │           │ /api/ai/*      → Anthropic proxy      │
└──────────────────┘           │                  (debit credits)      │
        │ Clerk/Supabase Auth  └──────────────┬───────────────────────┘
        ▼                                     ▼
   Session JWT                     Supabase Postgres
                                   users, ledger_entries (append-only),
                                   purchases, usage_events, api_keys
```

Key decisions for the implementer:
- **Auth**: Supabase Auth (email magic link) — one vendor for auth + DB. Clerk is acceptable if Supabase Auth fights Expo web; decide in Phase 2, don't build both.
- **Ledger**: append-only `ledger_entries` (`user_id, delta, reason, ref_id, created_at`); balance = SUM(delta), cached materialized view if needed. Never store a mutable balance column as source of truth.
- **AI gateway**: a Vercel serverless route wrapping the Anthropic SDK (default `claude-sonnet-5` for tutor/playground). Debit = `ceil((input_tokens*in_rate + output_tokens*out_rate) * margin / $0.01)`. Reject the call up-front if balance < a conservative estimate; reconcile after the response. LiteLLM proxy is overkill at this scale — a single route file is enough.
- **Payments/tax**: Stripe Checkout + **Stripe Tax** for sales-tax calculation. Delete `services/taxEngine.ts` (see legal note).

---

## 4. Build Phases

### Phase 0 — De-crypto cleanup (small, mechanical — good Sonnet task)
1. Remove deps: `@walletconnect/*`, `ethers`, `web3modal`, `@types` strays.
2. Delete dead services (the repo has ~10 experimental wallet files): `walletService.js`, `walletConnect*.ts` (all variants), `realWalletService.ts`, `simpleWalletService.ts`, `web3.ts`, `web3ModalService.ts`, `useWeb3.ts`, `tokenContract.js`, `etherscan.js`, `hooks/web3.ts`, `transactionTracker.ts`, `verify_tax.ts`.
3. Strip `useWeb3` usage from `index.tsx`, `reserve.tsx`, `profile.tsx`; remove ETH price fetch from Home.
4. Delete `services/taxEngine.ts` and all "SEC/CFTC", "CLARITY Act", "non-security Digital Tool", "Soulbound", "API Gas" copy from screens and README.
5. Acceptance: `npx expo export -p web` builds clean; no `walletconnect|ethers|web3` matches outside `node_modules`.

### Phase 1 — Rebrand & website messaging (Sonnet)
1. Keep the Obsidian & Gold theme (`theme/index.js`) — it's an asset, not crypto-specific.
2. New hero (`app/(tabs)/index.tsx`): "Apollo18 — AI usage, tokenized. Buy credits once, spend them on the AI that teaches you AI." Cards: Course, Credits/Pricing, (coming soon) Developer API.
3. Tabs (`app/_layout.tsx`): Home · Pricing (rename `reserve.tsx` route/label from "Checkout") · Course · Dashboard (rename Profile).
4. `reserve.tsx` → pricing page: three credit packs + course purchase card; buttons stub to Phase 2 checkout. Remove KYC modal, geo-gating mock, email-to-Google-Sheets capture.
5. Footer: replace crypto disclaimers with plain ToS/Privacy links and "Credits are prepaid service credits, non-refundable except as required by law; not a financial instrument."
6. Rewrite `README.md` as a normal project README (what Apollo18 is, stack, how to run/deploy).
7. Acceptance: deployed Vercel site shows zero crypto references; Lighthouse sanity pass.

### Phase 2 — Auth, ledger, and Stripe (architecture-sensitive — good Opus task)
1. Supabase project: `users` (from auth), `purchases`, `ledger_entries`, RLS on all tables.
2. `/api/checkout`: creates Stripe Checkout Session (credit packs + course SKU), `automatic_tax: enabled`.
3. `/api/stripe-webhook`: verifies signature, idempotent insert into `purchases` + `ledger_entries` (credit grant or course entitlement).
4. Dashboard tab: balance, transaction history, "buy more" — replaces the wallet profile.
5. Course tab gates on entitlement instead of token ownership.
6. Acceptance: test-mode purchase end-to-end (checkout → webhook → balance visible); webhook replay does not double-credit.

### Phase 3 — Metered AI features (Opus for the gateway, Sonnet for UI)
1. `/api/ai/tutor` and `/api/ai/playground`: authenticated, streaming, Anthropic-backed; debit credits per call as specified in §3; write `usage_events` rows (model, in/out tokens, credits).
2. Course portal gains the AI Tutor pane; new Playground section on the Course or Dashboard tab.
3. Insufficient-balance UX: clear error + one-tap route to Pricing.
4. Acceptance: a metered call visibly reduces the balance shown on Dashboard; usage history lists the event.

### Phase 4 — Developer API (later; scope gate before starting)
1. `api_keys` table + key management UI on Dashboard.
2. `/api/v1/messages` pass-through gateway with per-key credit debit and rate limits.
3. Revisit Option B (Stripe Billing Meters / Lago) if invoicing or postpaid contracts appear.

---

## 5. Compliance & Legal (flag for the owner, not for the models to "solve")

- The repo's claimed **"SEC/CFTC March 17, 2026 Interpretation"** and **Texas 20% data-processing exemption at a flat 8.25%** are unverified marketing-driven assertions. The pivot makes the SEC question moot; sales tax should be delegated to **Stripe Tax**, and a Texas CPA should confirm treatment of prepaid credits (they resemble gift-card liabilities — breakage/escheatment rules may apply).
- Prepaid credits need simple published terms: expiry (or none), refund policy, and "not redeemable for cash."
- Remove "Authorized by Apollo Technologies US" regulatory framing entirely; replace with standard ToS/Privacy pages (template is fine to start).

## 6. Hand-off Notes

- **Sonnet**: Phases 0 and 1 (mechanical cleanup + UI/copy), Phase 3 UI. Low ambiguity, file lists above are explicit.
- **Opus**: Phase 2 and the Phase 3 gateway (idempotent webhook, append-only ledger, streaming debit reconciliation). These have correctness stakes — double-crediting and race-y debits are the failure modes to design against.
- Keep phases as separate PRs; Phase 0 must land before Phase 1 to avoid rebasing UI work over deleted services.
- Env vars to provision before Phase 2: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`.
