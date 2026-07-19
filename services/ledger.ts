// services/ledger.ts
// Read-only queries against the Phase 2 ledger tables. RLS restricts every
// row to auth.uid() = user_id, so these always return only the signed-in
// user's own data — no user_id parameter needed, Supabase infers it from the
// session on the client.
import { supabase } from './supabase';

export interface Purchase {
  id: string;
  processor: 'stripe' | 'coinbase';
  sku: string;
  kind: 'credits' | 'course';
  amount_usd: number;
  created_at: string;
}

export async function getCreditBalance(): Promise<number> {
  const { data, error } = await supabase
    .from('credit_balances')
    .select('balance')
    .maybeSingle();

  if (error) {
    console.error('Failed to load credit balance:', error);
    return 0;
  }
  // No ledger rows yet for this user = no row in the view = balance 0.
  return data?.balance ?? 0;
}

export async function getPurchaseHistory(): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('id, processor, sku, kind, amount_usd, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load purchase history:', error);
    return [];
  }
  return data ?? [];
}

export async function getOwnedCourseSkus(): Promise<string[]> {
  const { data, error } = await supabase
    .from('entitlements')
    .select('sku');

  if (error) {
    console.error('Failed to load entitlements:', error);
    return [];
  }
  return (data ?? []).map((row) => row.sku);
}
