// api/_lib/supabase.ts
// Server-only Supabase clients. NEVER import this from app/ (client) code —
// the service-role key must never reach the browser.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  // Fail loud at cold start rather than silently mis-crediting later.
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
}

// Service-role client: bypasses RLS. Used by the webhook to fulfill purchases.
export const supabaseAdmin = createClient(SUPABASE_URL ?? '', SERVICE_ROLE_KEY ?? '', {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Verify a user's access token (Supabase session JWT) and return their id.
// Used by /api/checkout so the user_id comes from a verified token, not from
// client-supplied input.
export async function getUserIdFromToken(accessToken: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user.id;
}
