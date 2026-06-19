import { supabase } from '../client';
import type { Invitation, InvitationWithTrainer, NewInvitation } from '../types';

/**
 * Resolve an invite token to the invitation plus a summary of the inviting
 * trainer. Returns null when the token does not exist (uses `maybeSingle`).
 * Callers should still check `status`/`expires_at` before trusting it.
 */
export async function getInvitationByToken(token: string) {
  return supabase
    .from('invitations')
    .select(
      '*, trainer:users!invitations_trainer_id_fkey(id, name, avatar_url)',
    )
    .eq('token', token)
    .maybeSingle<InvitationWithTrainer>();
}

/** Create an invitation (trainer-side / seeding). */
export async function createInvitation(invitation: NewInvitation) {
  return supabase
    .from('invitations')
    .insert(invitation)
    .select()
    .single<Invitation>();
}

/** Mark an invitation accepted once the student completes registration. */
export async function acceptInvitation(id: string) {
  return supabase
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single<Invitation>();
}
