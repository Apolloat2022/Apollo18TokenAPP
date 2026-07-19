// api/checkout.ts
// Creates a Stripe Checkout Session for a signed-in user buying one SKU.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { getServerSku } from './_lib/skus';
import { getClerkUserId } from './_lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-02-24.acacia',
});

// Where to send the browser back after checkout. Set SITE_URL in Vercel
// (e.g. https://www.apollo18token.com); falls back to the request origin.
function siteUrl(req: VercelRequest): string {
  return process.env.SITE_URL || `https://${req.headers.host}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Authenticate the caller from their Clerk session token.
  const userId = await getClerkUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Not signed in' });

  // 2. Validate the requested SKU server-side.
  const sku = typeof req.body?.sku === 'string' ? req.body.sku : '';
  const serverSku = getServerSku(sku);
  if (!serverSku) return res.status(400).json({ error: 'Unknown SKU' });

  const priceId = process.env[serverSku.stripePriceEnv];
  if (!priceId) {
    console.error(`Missing Stripe price env ${serverSku.stripePriceEnv} for sku ${sku}`);
    return res.status(500).json({ error: 'Item not available for purchase' });
  }

  // 3. Create the Checkout Session. Amount is owned by the Stripe Price;
  //    user_id + sku ride along in metadata for the webhook to fulfill.
  try {
    const base = siteUrl(req);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      automatic_tax: { enabled: true },
      client_reference_id: userId,
      metadata: { user_id: userId, sku },
      success_url: `${base}/profile?checkout=success`,
      cancel_url: `${base}/reserve?checkout=cancelled`,
    });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: 'Could not start checkout' });
  }
}
