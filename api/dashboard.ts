// api/dashboard.ts
// Authenticated read endpoint. Returns ONLY the caller's own balance, purchase
// history, and course entitlements. This is the sole path by which the client
// sees ledger data — the browser never queries Postgres directly, and every
// query below is filtered by the verified Clerk user id (never a client input),
// so one user can never read another's rows.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getClerkUserId } from './_lib/auth';
import { sql } from './_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = await getClerkUserId(req.headers.authorization);
  if (!userId) return res.status(401).json({ error: 'Not signed in' });

  try {
    // Balance = SUM(delta) over the append-only ledger for this user only.
    const balanceRows = (await sql`
      select coalesce(sum(delta), 0)::int as balance
      from ledger_entries
      where user_id = ${userId}
    `) as Array<{ balance: number }>;

    const purchases = (await sql`
      select id, processor, sku, kind, amount_usd, created_at
      from purchases
      where user_id = ${userId}
      order by created_at desc
    `) as Array<Record<string, unknown>>;

    const entitlementRows = (await sql`
      select sku from entitlements where user_id = ${userId}
    `) as Array<{ sku: string }>;

    return res.status(200).json({
      balance: balanceRows[0]?.balance ?? 0,
      purchases,
      entitlements: entitlementRows.map((r) => r.sku),
    });
  } catch (err) {
    console.error('Dashboard query failed:', err);
    return res.status(500).json({ error: 'Could not load dashboard' });
  }
}
