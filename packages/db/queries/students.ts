import { supabase } from '../client';
import type { Goal, NewStudent, Student, User } from '../types';

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

/** A single student by id. */
export async function getStudentById(id: string) {
  return supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single<Student>();
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
 * public.users profile (role 'student'), then the students row linking it
 * to the trainer. The student gets an auth account later, when they sign
 * up on mobile with this email.
 */
export async function createStudentForTrainer(input: {
  trainerId: string;
  name: string;
  email: string;
  goal: Goal;
}) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({ email: input.email, role: 'student', name: input.name })
    .select()
    .single<User>();
  if (userError) return { data: null, error: userError };

  return supabase
    .from('students')
    .insert({
      trainer_id: input.trainerId,
      user_id: user.id,
      goal: input.goal,
      active: true,
    })
    .select()
    .single<Student>();
}
