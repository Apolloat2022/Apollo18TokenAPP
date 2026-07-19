// api/_lib/fulfill.ts
// The single call site for the atomic, idempotent fulfill_purchase() SQL
// function. Both webhooks (Stripe, Coinbase) go through here so the
// correctness-critical fulfillment path lives in exactly one place.
import { sql } from './db';
import type { SkuKind } from './skus';

export interface FulfillArgs {
  userId: string;
  processor: 'stripe' | 'coinbase';
  reference: string;   // Stripe session id / Coinbase charge id — the idempotency key
  eventId: string | null;
  sku: string;
  kind: SkuKind;
  amountUsd: number;
  credits: number;     // 0 for courses
}

// Returns true if THIS call performed the fulfillment, false if it was already
// fulfilled (replay / second event for the same purchase). Throws on DB error
// so the caller can return 500 and let the processor retry — the operation is
// safe to repeat.
//
// Explicit casts on every parameter: the neon HTTP driver sends params without
// type annotations, and Postgres can otherwise fail to infer a type for a NULL
// (p_event_id) or pick the wrong numeric type. Casting removes that ambiguity.
export async function fulfillPurchase(args: FulfillArgs): Promise<boolean> {
  const rows = (await sql`
    select fulfill_purchase(
      ${args.userId}::text,
      ${args.processor}::text,
      ${args.reference}::text,
      ${args.eventId}::text,
      ${args.sku}::text,
      ${args.kind}::text,
      ${args.amountUsd}::numeric,
      ${args.credits}::integer
    ) as fulfilled
  `) as Array<{ fulfilled: boolean }>;

  return rows[0]?.fulfilled === true;
}
