// api/eth-checkout.ts
// Creates a Coinbase Commerce hosted charge so a signed-in user can pay the
// USD price in ETH. No wallet code runs in our app — the customer's wallet
// talks only to Coinbase's hosted checkout page we redirect them to.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getServerSku } from './_lib/skus';
import { getClerkUserId } from './_lib/auth';

const COMMERCE_API = 'https://api.commerce.coinbase.com/charges';
const API_KEY = process.env.COINBASE_COMMERCE_API_KEY ?? '';

function siteUrl(req: VercelRequest): string {
  return process.env.SITE_URL || `https://${req.headers.host}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!API_KEY) {
    console.error('Missing COINBASE_COMMERCE_API_KEY');
    return res.status(500).json({ error: 'ETH payments unavailable' });
  }

  // 1. Authenticate the caller from their Clerk session token.
  const userId = await getClerkUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Not signed in' });

  // 2. Validate the requested SKU server-side. The USD price comes from our
  //    server map, never from the client.
  const sku = typeof req.body?.sku === 'string' ? req.body.sku : '';
  const serverSku = getServerSku(sku);
  if (!serverSku) return res.status(400).json({ error: 'Unknown SKU' });

  // 3. Create a fixed-price charge. Coinbase shows the customer the live ETH
  //    equivalent; user_id + sku ride along in metadata for the webhook.
  try {
    const base = siteUrl(req);
    const response = await fetch(COMMERCE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': API_KEY,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify({
        name: serverSku.title,
        description: serverSku.kind === 'credits'
          ? `${serverSku.credits} Apollo18 Credits`
          : 'Apollo18 course access',
        pricing_type: 'fixed_price',
        local_price: { amount: serverSku.priceUsd.toFixed(2), currency: 'USD' },
        metadata: { user_id: userId, sku },
        redirect_url: `${base}/profile?checkout=success`,
        cancel_url: `${base}/pricing?checkout=cancelled`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Coinbase charge creation failed:', response.status, detail);
      return res.status(502).json({ error: 'Could not start ETH checkout' });
    }

    const json = await response.json();
    return res.status(200).json({ url: json.data?.hosted_url });
  } catch (err) {
    console.error('Coinbase checkout error:', err);
    return res.status(500).json({ error: 'Could not start ETH checkout' });
  }
}
