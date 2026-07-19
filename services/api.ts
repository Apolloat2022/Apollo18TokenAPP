// services/api.ts
// Client helpers for our own authenticated API routes. The browser never talks
// to Postgres directly — it calls these endpoints with a Clerk session token,
// and the server filters everything by the verified user id.
//
// Relative URLs resolve to the same Vercel origin on web (the deploy target).

export interface Purchase {
  id: string;
  processor: 'stripe' | 'coinbase';
  sku: string;
  kind: 'credits' | 'course';
  amount_usd: number;
  created_at: string;
}

export interface DashboardData {
  balance: number;
  purchases: Purchase[];
  entitlements: string[];
}

export async function fetchDashboard(token: string): Promise<DashboardData> {
  const res = await fetch('/api/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Could not load dashboard');
  return res.json();
}

// Starts a checkout and returns the hosted-page URL to redirect to.
export async function createCheckout(rail: 'card' | 'eth', sku: string, token: string): Promise<string> {
  const endpoint = rail === 'card' ? '/api/checkout' : '/api/eth-checkout';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sku }),
  });
  const json = await res.json();
  if (!res.ok || !json.url) throw new Error(json.error || 'Checkout could not be started');
  return json.url as string;
}
