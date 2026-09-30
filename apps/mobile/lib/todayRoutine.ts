import type { DayOfWeek, RoutineWithExercises } from '@mobvex/db';

/** JS `Date#getDay()` index (0 = Sunday) → DayOfWeek. */
const JS_DAY_TO_DAY_OF_WEEK: readonly DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

/** Rough time a single working set takes, excluding the prescribed rest. */
const SET_WORK_SECONDS = 45;

export type TodayRoutineState =
  /** The student has no active routines at all. */
  | { kind: 'empty' }
  /** Routines exist, but none is scheduled for today. */
  | { kind: 'rest'; day: DayOfWeek }
  /** The routine to show for today. */
  | { kind: 'routine'; day: DayOfWeek; routine: RoutineWithExercises };

/** The DayOfWeek for a date (defaults to now). */
export function getDayOfWeek(date = new Date()): DayOfWeek {
  return JS_DAY_TO_DAY_OF_WEEK[date.getDay()] ?? 'monday';
}

/**
 * Pick today's routine from the student's active routines. A routine assigned
 * to today's weekday wins; otherwise a routine with no weekday (assigned for
 * any day) is used; otherwise today is a rest day.
 */
export function resolveTodayRoutine(
  routines: readonly RoutineWithExercises[],
  day: DayOfWeek,
): TodayRoutineState {
  if (routines.length === 0) return { kind: 'empty' };
  const routine =
    routines.find((r) => r.day_of_week === day) ??
    routines.find((r) => r.day_of_week == null);
  return routine ? { kind: 'routine', day, routine } : { kind: 'rest', day };
}

/** Estimated duration in minutes, from sets × (work + rest), rounded to 5. */
export function estimateRoutineMinutes(routine: RoutineWithExercises): number {
  const seconds = routine.routine_exercises.reduce(
    (total, re) => total + re.sets * (SET_WORK_SECONDS + re.rest_seconds),
    0,
  );
  return Math.max(5, Math.round(seconds / 60 / 5) * 5);
}

/** Distinct muscle groups covered by a routine, in exercise order. */
export function getMuscleGroups(routine: RoutineWithExercises): string[] {
  const groups = routine.routine_exercises
    .map((re) => re.exercise.muscle_group)
    .filter((group): group is string => Boolean(group));
  return [...new Set(groups)];
}
