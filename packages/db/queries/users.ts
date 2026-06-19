import { supabase } from '../client';
import type { User } from '../types';

/** A single user (trainer or student) by id, including their role. */
export async function getUserById(id: string) {
  return supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single<User>();
}
