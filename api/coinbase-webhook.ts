// api/coinbase-webhook.ts
// Receives Coinbase Commerce events and fulfills ETH purchases exactly once.
//
// Correctness mirrors the Stripe webhook:
//   1. Verify the X-CC-Webhook-Signature HMAC-SHA256 over the RAW body.
//   2. Fulfill through fulfill_purchase(), keyed on (coinbase, charge id). We
//      fulfill on both charge:confirmed and charge:resolved; the second is a
//      no-op because the charge id is already recorded.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getServerSku } from './_lib/skus';
import { fulfillPurchase } from './_lib/fulfill';
import { readRawBody } from './_lib/rawBody';

const WEBHOOK_SECRET = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET ?? '';

// Charge states that mean "paid, grant the goods".
const FULFILL_EVENTS = new Set(['charge:confirmed', 'charge:resolved']);

export const config = { api: { bodyParser: false } };

function signatureValid(raw: Buffer, header: string): boolean {
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(raw).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(header, 'hex');
  // timingSafeEqual throws if lengths differ, so guard first.
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const header = req.headers['x-cc-webhook-signature'];
  const signature = Array.isArray(header) ? header[0] : header;
  if (!signature || !WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  // 1. Verify authenticity against the raw body.
  const raw = await readRawBody(req);
  if (!signatureValid(raw, signature)) {
    console.error('Coinbase webhook signature verification failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let payload: any;
  try {
    payload = JSON.parse(raw.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const event = payload?.event;
  if (!event?.type) return res.status(400).json({ error: 'Malformed event' });

  // 2. Only paid-charge events fulfill anything.
  if (!FULFILL_EVENTS.has(event.type)) {
    return res.status(200).json({ received: true });
  }

  const charge = event.data;
  const userId = charge?.metadata?.user_id;
  const sku = charge?.metadata?.sku;
  const chargeId = charge?.id;
  if (!userId || !sku || !chargeId) {
    console.error('Coinbase charge missing metadata/id', chargeId);
    return res.status(400).json({ error: 'Missing metadata' });
  }

  const serverSku = getServerSku(sku);
  if (!serverSku) {
    console.error('Coinbase webhook received unknown sku', sku);
    return res.status(400).json({ error: 'Unknown SKU' });
  }

  // Record the USD price we charged, not the ETH amount received.
  const amountUsd = Number(charge?.pricing?.local?.amount ?? serverSku.priceUsd);

  // 3. Atomic + idempotent fulfillment, keyed on (coinbase, chargeId).
  try {
    const fulfilled = await fulfillPurchase({
      userId,
      processor: 'coinbase',
      reference: chargeId,
      eventId: event.id ?? null,
      sku,
      kind: serverSku.kind,
      amountUsd,
      credits: serverSku.credits ?? 0,
    });
    return res.status(200).json({ received: true, newlyFulfilled: fulfilled });
  } catch (err) {
    // Return 500 so Coinbase retries — fulfillment is safe to repeat.
    console.error('fulfill_purchase failed:', err);
    return res.status(500).json({ error: 'Fulfillment failed' });
  }
}
