import { supabase } from '../client';
import type { User } from '../types';

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
