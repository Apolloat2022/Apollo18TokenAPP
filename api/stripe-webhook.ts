// api/stripe-webhook.ts
// Receives Stripe events and fulfills purchases exactly once.
//
// Two correctness guarantees:
//   1. Signature verification uses the RAW request body (Stripe signs bytes,
//      not parsed JSON), so we disable body parsing and read the stream.
//   2. Fulfillment goes through the fulfill_purchase() SQL function, which is
//      atomic and idempotent — a replayed event (same event.id) is a no-op.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getServerSku } from './_lib/skus';
import { fulfillPurchase } from './_lib/fulfill';
import { readRawBody } from './_lib/rawBody';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-02-24.acacia',
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';

// Disable Vercel's automatic body parsing so we can read the raw bytes that
// Stripe signed. (Verify this holds on the live runtime during the first test.)
export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature || !WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  // 1. Verify the event is genuinely from Stripe.
  let event: Stripe.Event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  // 2. Only completed checkouts fulfill anything.
  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Ignore sessions that haven't actually been paid.
  if (session.payment_status !== 'paid') {
    return res.status(200).json({ received: true, note: 'not paid' });
  }

  const userId = session.metadata?.user_id;
  const sku = session.metadata?.sku;
  if (!userId || !sku) {
    console.error('Checkout session missing user_id/sku metadata', session.id);
    return res.status(400).json({ error: 'Missing metadata' });
  }

  const serverSku = getServerSku(sku);
  if (!serverSku) {
    console.error('Webhook received unknown sku', sku);
    return res.status(400).json({ error: 'Unknown SKU' });
  }

  const amountUsd = (session.amount_total ?? 0) / 100;

  // 3. Atomic + idempotent fulfillment. Keyed on (stripe, session.id) so a
  //    redelivered event does nothing.
  try {
    const fulfilled = await fulfillPurchase({
      userId,
      processor: 'stripe',
      reference: session.id,
      eventId: event.id,
      sku,
      kind: serverSku.kind,
      amountUsd,
      credits: serverSku.credits ?? 0,
    });
    return res.status(200).json({ received: true, newlyFulfilled: fulfilled });
  } catch (err) {
    // Return 500 so Stripe retries — the operation is safe to repeat.
    console.error('fulfill_purchase failed:', err);
    return res.status(500).json({ error: 'Fulfillment failed' });
  }
}
