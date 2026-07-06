import { createClient } from '@supabase/supabase-js';

/**
 * The single Supabase client for the whole monorepo. Import `supabase` from here
 * — never call `createClient` anywhere else.
 *
 * Env vars are read only in this file. The mobile app (Expo) inlines values
 * prefixed with `EXPO_PUBLIC_`; Node contexts use the bare names.
 */
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Set SUPABASE_URL and SUPABASE_ANON_KEY ' +
      '(prefixed with EXPO_PUBLIC_ for the mobile app). See .env.example.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    // No URL-based session detection in React Native.
    detectSessionInUrl: false,
    // In the mobile app, pass AsyncStorage as `storage` from the app layer so
    // sessions survive app restarts. Web/Node fall back to the default storage.
  },
});
