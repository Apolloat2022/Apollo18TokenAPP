// services/supabase.ts
// Browser Supabase client, using the client-safe anon key. Never import the
// service-role key here — that lives only in api/_lib/supabase.ts (server).
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};
const supabaseUrl = (extra.supabaseUrl as string) || '';
const supabaseAnonKey = (extra.supabaseAnonKey as string) || '';

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured — set EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Auth/checkout/dashboard will be unavailable until then.');
}

// createClient() throws synchronously if the URL is empty, which would crash
// the whole app at module load before Supabase is provisioned. Fall back to a
// syntactically valid placeholder so the client constructs; every real call
// against it fails at request time instead, which the callers already handle.
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
