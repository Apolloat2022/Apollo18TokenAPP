-- Apollo18 Phase 2 schema (Neon Postgres) — credits ledger + entitlements.
-- Run once against the Neon project: `psql "$NEON_DATABASE_URL" -f db/schema.sql`
-- (or paste into the Neon SQL editor).
--
-- Design (see PLAN.md §3, v3.2):
--   * Balance is NEVER stored as a mutable column. It is SUM(delta) over an
--     append-only ledger, so it cannot drift and every change is auditable.
--   * Fulfillment is idempotent and processor-agnostic. Both Stripe and
--     Coinbase Commerce fulfill through fulfill_purchase(), keyed on the
--     PURCHASE identity (processor + reference = Stripe session id / Coinbase
--     charge id). Keying on the purchase (not the event) matters because
--     Coinbase emits several event types for one charge (charge:confirmed,
--     charge:resolved, ...); we may fulfill on more than one, and the unique
--     (processor, reference) constraint makes every call after the first a
--     no-op. Stripe redeliveries of checkout.session.completed collapse the
--     same way.
--   * NO row-level security, NO client-facing grants. Unlike the earlier
--     Supabase design, the browser never connects to Postgres. Every read
--     goes through an authenticated /api/* route that filters by the verified
--     Clerk user id (WHERE user_id = $1), and every write goes through a
--     signature-verified webhook. user_id is the Clerk user id (text), not a
--     FK into any auth table (Clerk is external to this database).

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per fulfilled purchase. (processor, reference) is the idempotency key.
create table if not exists purchases (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,               -- Clerk user id
  processor  text not null check (processor in ('stripe', 'coinbase')),
  reference  text not null,               -- Stripe session id / Coinbase charge id
  event_id   text,                        -- triggering event id (audit only, not the key)
  sku        text not null,
  kind       text not null check (kind in ('credits', 'course')),
  amount_usd numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  unique (processor, reference)
);

create index if not exists purchases_user_id_idx on purchases (user_id);

-- Append-only credit ledger. Positive delta = grant, negative = debit (Phase 3).
create table if not exists ledger_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    text not null,               -- Clerk user id
  delta      integer not null,
  reason     text not null,
  ref_id     text,
  created_at timestamptz not null default now()
);

create index if not exists ledger_entries_user_id_idx on ledger_entries (user_id);

-- Course access. One row per (user, course sku).
create table if not exists entitlements (
  user_id    text not null,               -- Clerk user id
  sku        text not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, sku)
);

-- ---------------------------------------------------------------------------
-- Atomic, idempotent fulfillment
-- ---------------------------------------------------------------------------
-- Called by the Stripe and Coinbase webhooks. Inserts the purchase and (for
-- credit packs) the ledger grant / (for courses) the entitlement in a SINGLE
-- transaction (a plpgsql function body runs in one transaction). If this
-- (processor, reference) was already recorded, it does nothing and returns
-- false, so a webhook stays a no-op on replay or on a second event for the
-- same purchase.

create or replace function fulfill_purchase(
  p_user_id    text,
  p_processor  text,
  p_reference  text,
  p_event_id   text,
  p_sku        text,
  p_kind       text,
  p_amount_usd numeric,
  p_credits    integer
) returns boolean
language plpgsql
as $$
declare
  v_purchase_id uuid;
begin
  -- The unique (processor, reference) constraint is the idempotency guard.
  -- ON CONFLICT DO NOTHING means a repeat inserts nothing and RETURNING yields
  -- no row, so we short-circuit below.
  insert into purchases (user_id, processor, reference, event_id, sku, kind, amount_usd)
  values (p_user_id, p_processor, p_reference, p_event_id, p_sku, p_kind, p_amount_usd)
  on conflict (processor, reference) do nothing
  returning id into v_purchase_id;

  if v_purchase_id is null then
    -- Already fulfilled. No-op.
    return false;
  end if;

  if p_kind = 'credits' then
    insert into ledger_entries (user_id, delta, reason, ref_id)
    values (p_user_id, p_credits, 'purchase:' || p_sku, p_processor || ':' || p_reference);
  elsif p_kind = 'course' then
    insert into entitlements (user_id, sku)
    values (p_user_id, p_sku)
    on conflict (user_id, sku) do nothing;
  end if;

  return true;
end;
$$;
