import { supabase } from '../client';
import type {
  Goal,
  Invitation,
  InvitationWithTrainer,
  NewInvitation,
} from '../types';

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

/**
 * Atomically claim a pending invitation for the signed-in student
 * (`claim_student_invitation` RPC, SECURITY DEFINER). Adopts the trainer's
 * placeholder `users` row when one exists — the `students` row keeps its id,
 * so pre-assigned routines/diets stay attached — otherwise creates the
 * profile + students link from scratch. Marks the invitation accepted.
 * Returns the student id linked to the caller. Idempotent, safe to retry.
 */
export async function claimStudentInvitation(input: {
  invitationId: string;
  name: string;
  goal: Goal;
}) {
  return supabase.rpc('claim_student_invitation', {
    p_invitation_id: input.invitationId,
    p_name: input.name,
    p_goal: input.goal,
  }) as unknown as Promise<{ data: string | null; error: Error | null }>;
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
