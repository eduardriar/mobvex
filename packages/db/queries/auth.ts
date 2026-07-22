import { supabase } from '../client';
import type { NewUser, User } from '../types';
import { createUser, getUserById } from './users';

/** Error code returned by `registerTrainer` when the email is already registered. */
export const EMAIL_ALREADY_REGISTERED = 'email_already_registered';

/**
 * Register a new trainer.
 * Creates the Supabase Auth user and triggers the confirmation email with a
 * 6-digit code. No session exists until the code is verified with
 * `verifyTrainerEmail`, which also inserts the public.users row.
 * Returns an error with message `EMAIL_ALREADY_REGISTERED` if the email
 * already belongs to a confirmed account.
 */
export async function registerTrainer(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: 'trainer' } },
  });
  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { data: null, error: new Error(EMAIL_ALREADY_REGISTERED) };
    }
    return { data: null, error };
  }
  if (!data.user) return { data: null, error: new Error('No user returned from sign-up') };

  // With email confirmation enabled, Supabase obfuscates duplicate sign-ups:
  // it returns a user with an empty identities array instead of an error.
  if (data.user.identities?.length === 0) {
    return { data: null, error: new Error(EMAIL_ALREADY_REGISTERED) };
  }

  return { data, error: null };
}

/**
 * Verify the 6-digit code sent to the trainer's email on sign-up.
 * On success Supabase establishes a session, and the matching public.users
 * row is created here (RLS requires an authenticated session to insert).
 */
export async function verifyTrainerEmail(email: string, token: string) {
  const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });
  if (verifyError) return { data: null, error: verifyError };
  if (!verifyData.user) {
    return { data: null, error: new Error('No user returned from verification') };
  }

  const { user } = verifyData;
  const name = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : '';
  const { data, error } = await supabase
    .from('users')
    .upsert({ id: user.id, email, role: 'trainer', name })
    .select()
    .single<User>();

  return { data, error };
}

/** Resend the sign-up confirmation code to the given email. */
export async function resendSignUpCode(email: string) {
  return supabase.auth.resend({ type: 'signup', email });
}

/** Sign in a trainer with email and password. */
export async function loginTrainer(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

/** Sign out the current user. */
export async function logout() {
  return supabase.auth.signOut();
}

/** Get the current auth session (null if not signed in). */
export async function getSession() {
  return supabase.auth.getSession();
}

/** Fetch the public profile row for the currently signed-in user. */
export async function getCurrentProfile() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: authError ?? new Error('Not authenticated') };
  }

  return supabase.from('users').select('*').eq('id', user.id).single<User>();
}

/**
 * Subscribe to auth state changes. Returns an unsubscribe function.
 * Use in useEffect: `return subscribeToAuthChanges(cb)`.
 */
export function subscribeToAuthChanges(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}

/*
 * Student registration (passwordless/OTP) — used by the mobile register flow.
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
 * Dev-only: sign in with email + password, bypassing the student OTP flow.
 * Only succeeds for accounts that already have a password set on
 * `auth.users` (e.g. pre-provisioned test/seed accounts) — the normal
 * passwordless registration path never sets one. Callers must gate this
 * behind `__DEV__`; it exists purely to skip email delivery while testing.
 */
export async function devLoginWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
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
