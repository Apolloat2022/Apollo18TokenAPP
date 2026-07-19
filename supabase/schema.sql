-- Apollo18 Phase 2 schema — credits ledger + entitlements.
-- Run this in the Supabase SQL editor once the project exists.
--
-- Design (see PLAN.md §3):
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

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- One row per fulfilled purchase. (processor, reference) is the idempotency key.
create table if not exists public.purchases (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  processor  text not null check (processor in ('stripe', 'coinbase')),
  reference  text not null,               -- Stripe session id / Coinbase charge id
  event_id   text,                        -- triggering event id (audit only, not the key)
  sku        text not null,
  kind       text not null check (kind in ('credits', 'course')),
  amount_usd numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  unique (processor, reference)
);

-- Append-only credit ledger. Positive delta = grant, negative = debit (Phase 3).
create table if not exists public.ledger_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  delta      integer not null,
  reason     text not null,
  ref_id     text,
  created_at timestamptz not null default now()
);

create index if not exists ledger_entries_user_id_idx
  on public.ledger_entries (user_id);

-- Course access. One row per (user, course sku).
create table if not exists public.entitlements (
  user_id    uuid not null references auth.users (id) on delete cascade,
  sku        text not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, sku)
);

-- ---------------------------------------------------------------------------
-- Balance view
-- ---------------------------------------------------------------------------

create or replace view public.credit_balances as
  select user_id, coalesce(sum(delta), 0)::integer as balance
  from public.ledger_entries
  group by user_id;

-- ---------------------------------------------------------------------------
-- Atomic, idempotent fulfillment
-- ---------------------------------------------------------------------------
-- Called by the Stripe and Coinbase webhooks. Inserts the purchase and (for
-- credit packs) the ledger grant / (for courses) the entitlement in a SINGLE
-- transaction. If this (processor, reference) was already recorded, it does
-- nothing and returns false, so a webhook stays a no-op on replay or on a
-- second event for the same purchase.
--
-- SECURITY DEFINER: the webhook uses the service-role key (which bypasses RLS),
-- but defining it this way keeps behavior correct regardless of caller role.

create or replace function public.fulfill_purchase(
  p_user_id    uuid,
  p_processor  text,
  p_reference  text,
  p_event_id   text,
  p_sku        text,
  p_kind       text,
  p_amount_usd numeric,
  p_credits    integer
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase_id uuid;
begin
  -- The unique (processor, reference) constraint is the idempotency guard.
  -- ON CONFLICT DO NOTHING means a repeat inserts nothing and RETURNING yields
  -- no row, so we short-circuit below.
  insert into public.purchases (user_id, processor, reference, event_id, sku, kind, amount_usd)
  values (p_user_id, p_processor, p_reference, p_event_id, p_sku, p_kind, p_amount_usd)
  on conflict (processor, reference) do nothing
  returning id into v_purchase_id;

  if v_purchase_id is null then
    -- Already fulfilled. No-op.
    return false;
  end if;

  if p_kind = 'credits' then
    insert into public.ledger_entries (user_id, delta, reason, ref_id)
    values (p_user_id, p_credits, 'purchase:' || p_sku, p_processor || ':' || p_reference);
  elsif p_kind = 'course' then
    insert into public.entitlements (user_id, sku)
    values (p_user_id, p_sku)
    on conflict (user_id, sku) do nothing;
  end if;

  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Users may read only their own rows. All writes happen through the webhooks
-- using the service-role key, which bypasses RLS — so there are deliberately
-- NO insert/update policies for anon/authenticated roles.

alter table public.purchases       enable row level security;
alter table public.ledger_entries  enable row level security;
alter table public.entitlements    enable row level security;

create policy "own purchases readable"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "own ledger readable"
  on public.ledger_entries for select
  using (auth.uid() = user_id);

create policy "own entitlements readable"
  on public.entitlements for select
  using (auth.uid() = user_id);
