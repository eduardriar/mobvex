import { supabase } from '../client';
import type {
  Goal,
  Invitation,
  NewStudent,
  Student,
  StudentWithUser,
  User,
} from '../types';
import { createInvitation } from './invitations';

/** Active students belonging to a trainer, newest first. */
export async function getStudents(trainerId: string) {
  return supabase
    .from('students')
    .select('*')
    .eq('trainer_id', trainerId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .returns<Student[]>();
}

/**
 * Active students of a trainer joined with each student's user profile
 * (name/email/avatar) for roster display. The FK hint disambiguates from
 * the trainer_id relation to the same users table.
 */
export async function getStudentsWithUser(trainerId: string) {
  return supabase
    .from('students')
    .select('*, user:users!students_user_id_fkey(id, name, email, avatar_url)')
    .eq('trainer_id', trainerId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .returns<StudentWithUser[]>();
}

/** A single student by id. */
export async function getStudentById(id: string) {
  return supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single<Student>();
}

/**
 * The student profile linked to an auth user, or null when none exists (e.g. a
 * trainer, or a user who has not completed onboarding). Uses `maybeSingle` so a
 * missing row is not treated as an error.
 */
export async function getStudentByUserId(userId: string) {
  return supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<Student>();
}

/** Link a new student to a trainer. */
export async function createStudent(student: NewStudent) {
  return supabase
    .from('students')
    .insert(student)
    .select()
    .single<Student>();
}

/**
 * Create a brand-new student for a trainer: inserts the student's
 * public.users profile (role 'student'), the students row linking it to
 * the trainer, and an invitation bound to the student's email. The
 * invitation's token is what goes in the invite link — the mobile register
 * flow resolves it via `getInvitationByToken`. The student gets an auth
 * account later, when they sign up on mobile with this email.
 */
export async function createStudentForTrainer(input: {
  trainerId: string;
  name: string;
  email: string;
  goal: Goal;
}): Promise<
  | { data: { student: Student; invitation: Invitation }; error: null }
  | { data: null; error: Error }
> {
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({ email: input.email, role: 'student', name: input.name })
    .select()
    .single<User>();
  if (userError) return { data: null, error: userError };

  const { data: student, error: studentError } = await supabase
    .from('students')
    .insert({
      trainer_id: input.trainerId,
      user_id: user.id,
      goal: input.goal,
      active: true,
    })
    .select()
    .single<Student>();
  if (studentError) return { data: null, error: studentError };

  const { data: invitation, error: inviteError } = await createInvitation({
    trainer_id: input.trainerId,
    email: input.email,
  });
  if (inviteError) return { data: null, error: inviteError };

  return { data: { student, invitation }, error: null };
}
