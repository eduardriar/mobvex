import { supabase } from '../client';
import type { NewUser } from '../types';
import { createUser, getUserById } from './users';

/**
 * Auth data-access for the registration flow. These wrap Supabase Auth and the
 * `users` profile table; screens call these instead of touching `supabase`
 * directly. Each returns the Supabase `{ data, error }` shape — callers must
 * check `error`.
 */

/**
 * Send a one-time code to `email`. Creates the auth user if it does not exist
 * yet, so the same call serves first-time signup and returning users.
 */
export async function signUpWithEmailOtp(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
}

/**
 * Verify the 6-digit code sent to `email`. On success a session is established
 * and persisted, and `data.user` holds the authenticated auth user.
 */
export async function verifyEmailOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({ email, token, type: 'email' });
}

/** The current authenticated auth user, or an error if not signed in. */
export async function getCurrentUser() {
  return supabase.auth.getUser();
}

/**
 * Return the user's profile row, creating it on first sign-in. After OTP
 * verification the auth user exists but has no `users` row yet; this fills that
 * gap idempotently. `input.id` must equal the authenticated `auth.uid()`.
 */
export async function getOrCreateUserProfile(input: NewUser) {
  const existing = await getUserById(input.id);
  if (existing.data) {
    return existing;
  }
  // `.single()` returns PGRST116 ("no rows") when the profile is missing — that
  // is the create path. Any other error is real and should surface to the caller.
  if (existing.error && existing.error.code !== 'PGRST116') {
    return existing;
  }
  return createUser(input);
}
