import { supabase } from '../client';
import type { NewUser, User } from '../types';

/** A single user (trainer or student) by id, including their role. */
export async function getUserById(id: string) {
  return supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single<User>();
}

/**
 * Create a user profile row. `id` must equal the Supabase Auth user id so the
 * profile is linked to the authenticated user (and satisfies RLS).
 */
export async function createUser(user: NewUser) {
  return supabase
    .from('users')
    .insert(user)
    .select()
    .single<User>();
}
