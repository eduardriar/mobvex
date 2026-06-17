import { supabase } from '../client';
import type { ActiveSession, RoutineExercise, SetLog } from '../types';

const ACTIVE_SESSION_SELECT =
  '*, routine:routines(*), set_logs(*, routine_exercise:routine_exercises(*, exercise:exercises(*)))';

/**
 * The student's current active session (with its routine and prescribed set
 * logs), or null if none is in progress. Sets are ordered by exercise position
 * then set number.
 */
export async function getActiveSession(studentId: string) {
  return supabase
    .from('workout_sessions')
    .select(ACTIVE_SESSION_SELECT)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .order('set_number', { referencedTable: 'set_logs', ascending: true })
    .maybeSingle<ActiveSession>();
}

/**
 * Start a new active session for a routine and pre-create one set log per
 * prescribed set (from each routine exercise's `sets`), so the tracker UI has a
 * ready grid to fill. Returns the created session row.
 *
 * Assumes no session is already active for the student — the database enforces
 * this with a partial unique index, so a second start will error.
 */
export async function startSession(studentId: string, routineId: string) {
  const { data: session, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({ student_id: studentId, routine_id: routineId })
    .select()
    .single();

  if (sessionError || !session) {
    return { data: null, error: sessionError };
  }

  const { data: prescriptions, error: prescriptionsError } = await supabase
    .from('routine_exercises')
    .select('id, sets')
    .eq('routine_id', routineId)
    .order('order', { ascending: true })
    .returns<Pick<RoutineExercise, 'id' | 'sets'>[]>();

  if (prescriptionsError) {
    return { data: null, error: prescriptionsError };
  }

  const setLogs = (prescriptions ?? []).flatMap((prescription) =>
    Array.from({ length: prescription.sets }, (_, index) => ({
      session_id: session.id,
      routine_exercise_id: prescription.id,
      set_number: index + 1,
    })),
  );

  if (setLogs.length > 0) {
    const { error: logsError } = await supabase.from('set_logs').insert(setLogs);
    if (logsError) {
      return { data: null, error: logsError };
    }
  }

  return { data: session, error: null };
}

/** Update a single logged set (weight, reps, RIR, completed flag). */
export async function updateSetLog(
  id: string,
  changes: Partial<Pick<SetLog, 'weight_kg' | 'reps' | 'rir' | 'completed'>>,
) {
  return supabase
    .from('set_logs')
    .update(changes)
    .eq('id', id)
    .select()
    .single<SetLog>();
}

/** Mark a session as completed, stamping the completion time. */
export async function completeSession(id: string) {
  return supabase
    .from('workout_sessions')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

/** Mark a session as abandoned, stamping the time it was ended. */
export async function abandonSession(id: string) {
  return supabase
    .from('workout_sessions')
    .update({ status: 'abandoned', completed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}
