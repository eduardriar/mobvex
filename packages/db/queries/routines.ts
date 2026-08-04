import { supabase } from '../client';
import type {
  DayOfWeek,
  NewRoutine,
  Routine,
  RoutineExercise,
  RoutineWithExercises,
} from '../types';

/** Active routines assigned to a student. */
export async function getRoutines(studentId: string) {
  return supabase
    .from('routines')
    .select('*')
    .eq('student_id', studentId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .returns<Routine[]>();
}

/** Active routines assigned to a student, each with its prescribed exercises. */
export async function getAssignedRoutines(studentId: string) {
  return supabase
    .from('routines')
    .select('*, routine_exercises(*, exercise:exercises(*))')
    .eq('student_id', studentId)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .order('order', { referencedTable: 'routine_exercises', ascending: true })
    .returns<RoutineWithExercises[]>();
}

/** A routine with its prescribed exercises, ordered within the routine. */
export async function getRoutineById(id: string) {
  return supabase
    .from('routines')
    .select('*, routine_exercises(*, exercise:exercises(*))')
    .eq('id', id)
    .order('order', { referencedTable: 'routine_exercises', ascending: true })
    .single<RoutineWithExercises>();
}

/** Assign (create) a routine for a student. */
export async function assignRoutine(routine: NewRoutine) {
  return supabase
    .from('routines')
    .insert(routine)
    .select()
    .single<Routine>();
}

/** One prescribed exercise within a saveRoutinePlan day. */
export type PlanExerciseInput = {
  exerciseId: string;
  order: number;
  sets: number;
  reps: string;
  restSeconds: number;
  targetWeight?: number | null;
};

/** One active day within saveRoutinePlan — rest days are simply absent. */
export type PlanDayInput = {
  dayOfWeek: DayOfWeek;
  /** The day's focus label (e.g. "Tren superior"). */
  name: string;
  /** The overall plan's name — the same value on every day of the plan. */
  description?: string | null;
  exercises: PlanExerciseInput[];
};

/**
 * Save a student's weekly routine plan: deactivates any currently active
 * routines and creates one fresh active Routine per active day, each with its
 * prescribed exercises. Days with no exercises are skipped entirely (they
 * round-trip back as rest days). No transaction over PostgREST — if a day
 * fails midway, every routine created by this call so far is deleted again
 * (cascading its routine_exercises) so the previous plan isn't
 * half-replaced; the previous plan's data was already deactivated, not lost.
 */
export async function saveRoutinePlan(input: {
  studentId: string;
  trainerId: string;
  days: PlanDayInput[];
}) {
  const { error: deactivateError } = await supabase
    .from('routines')
    .update({ active: false })
    .eq('student_id', input.studentId)
    .eq('active', true);
  if (deactivateError) return { data: null, error: deactivateError };

  const days = input.days.filter((day) => day.exercises.length > 0);
  const createdIds: string[] = [];

  for (const day of days) {
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .insert({
        student_id: input.studentId,
        trainer_id: input.trainerId,
        name: day.name,
        description: day.description,
        day_of_week: day.dayOfWeek,
        active: true,
      })
      .select()
      .single<Routine>();
    if (routineError) {
      await supabase.from('routines').delete().in('id', createdIds);
      return { data: null, error: routineError };
    }
    createdIds.push(routine.id);

    const { error: exercisesError } = await supabase
      .from('routine_exercises')
      .insert(
        day.exercises.map((exercise) => ({
          routine_id: routine.id,
          exercise_id: exercise.exerciseId,
          order: exercise.order,
          sets: exercise.sets,
          reps: exercise.reps,
          rest_seconds: exercise.restSeconds,
          target_weight: exercise.targetWeight,
        })),
      )
      .select()
      .returns<RoutineExercise[]>();
    if (exercisesError) {
      await supabase.from('routines').delete().in('id', createdIds);
      return { data: null, error: exercisesError };
    }
  }

  return { data: { ids: createdIds }, error: null };
}
