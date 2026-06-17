// Mobvex — database seed.
//
// Run with: pnpm --filter @mobvex/db db:seed
//
// Seeds the global exercise catalog (rows with trainer_id = null, shared across
// all trainers) and a demo chain — a trainer, a student and several routines
// assigned to that student — wiring catalog exercises into each routine via the
// `routine_exercises` join table.
//
// The seed is idempotent: it uses fixed UUIDs, rebuilds each routine's
// prescriptions on every run, and removes any prior seed routine for the
// student that is no longer listed here — so re-running never creates
// duplicates or leaves orphans.

import { Goal, PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// Stable identifiers so re-runs upsert the same rows.
const TRAINER_USER_ID = '00000000-0000-0000-0000-000000000001';
const STUDENT_USER_ID = '00000000-0000-0000-0000-000000000002';
const STUDENT_ID = '00000000-0000-0000-0000-000000000003';

type CatalogExercise = {
  name: string;
  muscleGroup: string;
};

// Global catalog — what each exercise *is*. Prescription (sets/reps/rest) is
// applied per routine, not stored here.
const EXERCISE_CATALOG: CatalogExercise[] = [
  { name: 'Barbell Back Squat', muscleGroup: 'Quadriceps' },
  { name: 'Barbell Bench Press', muscleGroup: 'Chest' },
  { name: 'Conventional Deadlift', muscleGroup: 'Back' },
  { name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { name: 'Bent-Over Barbell Row', muscleGroup: 'Back' },
  { name: 'Pull-Up', muscleGroup: 'Back' },
  { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings' },
  { name: 'Incline Dumbbell Press', muscleGroup: 'Chest' },
  { name: 'Seated Cable Row', muscleGroup: 'Back' },
  { name: 'Leg Press', muscleGroup: 'Quadriceps' },
  { name: 'Lateral Raise', muscleGroup: 'Shoulders' },
  { name: 'Barbell Curl', muscleGroup: 'Biceps' },
  { name: 'Triceps Rope Pushdown', muscleGroup: 'Triceps' },
  { name: 'Plank', muscleGroup: 'Core' },
];

type SeedPrescription = {
  exerciseName: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
};

type SeedRoutine = {
  id: string;
  name: string;
  description: string;
  prescriptions: SeedPrescription[];
};

// Routines assigned to the demo student (a Push/Pull/Legs split). Names and
// descriptions are user-facing copy, so they are in Spanish.
const SEED_ROUTINES: SeedRoutine[] = [
  {
    id: '00000000-0000-0000-0000-000000000010',
    name: 'Empuje — Pecho, Hombro y Tríceps',
    description: 'Día de empuje: pecho, hombros y tríceps.',
    prescriptions: [
      { exerciseName: 'Barbell Bench Press', sets: 4, reps: '6-8', restSeconds: 150, notes: 'Retract the shoulder blades; touch mid-chest.' },
      { exerciseName: 'Overhead Press', sets: 4, reps: '8-10', restSeconds: 120, notes: 'Squeeze glutes; bar travels over the mid-foot.' },
      { exerciseName: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restSeconds: 90, notes: 'Bench at 30°; control the negative.' },
      { exerciseName: 'Lateral Raise', sets: 3, reps: '12-15', restSeconds: 60, notes: 'Lead with the elbows; minimal momentum.' },
      { exerciseName: 'Triceps Rope Pushdown', sets: 3, reps: '12-15', restSeconds: 60, notes: 'Lock the elbows in place; full lockout.' },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    name: 'Tirón — Espalda y Bíceps',
    description: 'Día de tirón: espalda y bíceps.',
    prescriptions: [
      { exerciseName: 'Conventional Deadlift', sets: 3, reps: '5', restSeconds: 180, notes: 'Neutral spine; push the floor away.' },
      { exerciseName: 'Pull-Up', sets: 3, reps: 'to failure', restSeconds: 120, notes: 'Full hang to chin over the bar; add load if >12 reps.' },
      { exerciseName: 'Bent-Over Barbell Row', sets: 4, reps: '8-10', restSeconds: 120, notes: 'Hinge ~45°; pull to the lower ribs.' },
      { exerciseName: 'Seated Cable Row', sets: 3, reps: '12', restSeconds: 75, notes: 'Chest up; drive elbows back, no torso swing.' },
      { exerciseName: 'Barbell Curl', sets: 3, reps: '10-12', restSeconds: 60, notes: 'Elbows pinned; no swinging.' },
    ],
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    name: 'Pierna — Cuádriceps, Femoral y Core',
    description: 'Día de pierna: cuádriceps, femorales y core.',
    prescriptions: [
      { exerciseName: 'Barbell Back Squat', sets: 4, reps: '6-8', restSeconds: 150, notes: 'Brace the core; break at the hips and knees together.' },
      { exerciseName: 'Romanian Deadlift', sets: 3, reps: '10-12', restSeconds: 90, notes: 'Soft knees; feel the hamstring stretch.' },
      { exerciseName: 'Leg Press', sets: 4, reps: '10-12', restSeconds: 90, notes: 'Knees track over toes; avoid lockout.' },
      { exerciseName: 'Plank', sets: 3, reps: '60s', restSeconds: 45, notes: 'Straight line from head to heels; squeeze glutes.' },
    ],
  },
];

type SeedProgress = {
  /** Whole weeks before today; 0 is the most recent entry. */
  weeksAgo: number;
  weightKg: number;
  bodyFatPct: number;
  chestCm: number;
  armCm: number;
  waistCm: number;
  shoulderCm: number;
  quadsCm: number;
  calfCm: number;
  glutesCm: number;
  targetCalories: number;
  achievedCalories: number;
  notes?: string;
};

// Weekly progress for the demo student — a lean bulk (weight, chest and arm up,
// body fat and waist down) matching the muscle_gain goal.
const SEED_PROGRESS: SeedProgress[] = [
  { weeksAgo: 7, weightKg: 78.4, bodyFatPct: 19.5, chestCm: 102.5, armCm: 37.7, waistCm: 84.4, shoulderCm: 122.0, quadsCm: 58.0, calfCm: 38.0, glutesCm: 98.0, targetCalories: 2600, achievedCalories: 2710 },
  { weeksAgo: 6, weightKg: 78.9, bodyFatPct: 19.2, chestCm: 102.7, armCm: 37.8, waistCm: 84.0, shoulderCm: 122.3, quadsCm: 58.4, calfCm: 38.1, glutesCm: 98.3, targetCalories: 2600, achievedCalories: 2580 },
  { weeksAgo: 5, weightKg: 79.3, bodyFatPct: 18.8, chestCm: 102.9, armCm: 37.9, waistCm: 83.6, shoulderCm: 122.7, quadsCm: 58.8, calfCm: 38.3, glutesCm: 98.6, targetCalories: 2650, achievedCalories: 2640 },
  { weeksAgo: 4, weightKg: 79.8, bodyFatPct: 18.5, chestCm: 103.2, armCm: 38.0, waistCm: 83.2, shoulderCm: 123.1, quadsCm: 59.2, calfCm: 38.4, glutesCm: 98.9, targetCalories: 2650, achievedCalories: 2690 },
  { weeksAgo: 3, weightKg: 80.2, bodyFatPct: 18.1, chestCm: 103.4, armCm: 38.2, waistCm: 82.9, shoulderCm: 123.5, quadsCm: 59.6, calfCm: 38.6, glutesCm: 99.2, targetCalories: 2700, achievedCalories: 2660 },
  { weeksAgo: 2, weightKg: 80.6, bodyFatPct: 17.8, chestCm: 103.6, armCm: 38.3, waistCm: 82.5, shoulderCm: 123.9, quadsCm: 60.0, calfCm: 38.7, glutesCm: 99.5, targetCalories: 2700, achievedCalories: 2705 },
  { weeksAgo: 1, weightKg: 81.0, bodyFatPct: 17.5, chestCm: 103.8, armCm: 38.4, waistCm: 82.2, shoulderCm: 124.2, quadsCm: 60.3, calfCm: 38.9, glutesCm: 99.8, targetCalories: 2750, achievedCalories: 2700 },
  { weeksAgo: 0, weightKg: 81.3, bodyFatPct: 17.2, chestCm: 104.0, armCm: 38.5, waistCm: 82.0, shoulderCm: 124.5, quadsCm: 60.5, calfCm: 39.0, glutesCm: 100.0, targetCalories: 2750, achievedCalories: 2620, notes: 'Buen progreso, fuerza en alza.' },
];

/** A UTC date `weeks` whole weeks before today (time zeroed). */
function dateWeeksAgo(weeks: number): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - weeks * 7);
  return date;
}

async function main() {
  // 1. Global exercise catalog (trainer_id = null). Upsert by name so re-runs
  //    update muscle groups without duplicating rows.
  for (const exercise of EXERCISE_CATALOG) {
    const existing = await prisma.exercise.findFirst({
      where: { name: exercise.name, trainerId: null },
    });
    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: { muscleGroup: exercise.muscleGroup },
      });
    } else {
      await prisma.exercise.create({
        data: { name: exercise.name, muscleGroup: exercise.muscleGroup },
      });
    }
  }

  // 2. Demo trainer + student users (Supabase Auth would own these IDs in prod).
  const trainer = await prisma.user.upsert({
    where: { email: 'trainer.seed@mobvex.app' },
    update: { name: 'Carlos Moreno' },
    create: {
      id: TRAINER_USER_ID,
      email: 'trainer.seed@mobvex.app',
      role: Role.trainer,
      name: 'Carlos Moreno',
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student.seed@mobvex.app' },
    update: { name: 'Juan Pérez' },
    create: {
      id: STUDENT_USER_ID,
      email: 'student.seed@mobvex.app',
      role: Role.student,
      name: 'Juan Pérez',
    },
  });

  // 3. Student profile linking the student-user to the trainer.
  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: { trainerId: trainer.id, goal: Goal.muscle_gain, active: true },
    create: {
      id: STUDENT_ID,
      trainerId: trainer.id,
      userId: studentUser.id,
      goal: Goal.muscle_gain,
      active: true,
    },
  });

  // 4. Drop any prior seed routine for this student that is no longer listed
  //    here (routine_exercises cascade), so re-runs don't leave orphans.
  const seedRoutineIds = SEED_ROUTINES.map((routine) => routine.id);
  await prisma.routine.deleteMany({
    where: { studentId: student.id, id: { notIn: seedRoutineIds } },
  });

  // 5. Build a name -> id lookup for the catalog once, then create each routine.
  const catalogExercises = await prisma.exercise.findMany({
    where: { trainerId: null },
    select: { id: true, name: true },
  });
  const exerciseIdByName = new Map(catalogExercises.map((e) => [e.name, e.id]));

  let totalPrescriptions = 0;
  for (const seedRoutine of SEED_ROUTINES) {
    const routine = await prisma.routine.upsert({
      where: { id: seedRoutine.id },
      update: { name: seedRoutine.name, description: seedRoutine.description, active: true },
      create: {
        id: seedRoutine.id,
        studentId: student.id,
        trainerId: trainer.id,
        name: seedRoutine.name,
        description: seedRoutine.description,
        active: true,
      },
    });

    // Rebuild this routine's prescriptions so re-running stays idempotent.
    await prisma.routineExercise.deleteMany({ where: { routineId: routine.id } });
    await prisma.routineExercise.createMany({
      data: seedRoutine.prescriptions.map((prescription, index) => {
        const exerciseId = exerciseIdByName.get(prescription.exerciseName);
        if (!exerciseId) {
          throw new Error(`Seed exercise not found in catalog: ${prescription.exerciseName}`);
        }
        return {
          routineId: routine.id,
          exerciseId,
          order: index,
          sets: prescription.sets,
          reps: prescription.reps,
          restSeconds: prescription.restSeconds,
          notes: prescription.notes,
        };
      }),
    });
    totalPrescriptions += seedRoutine.prescriptions.length;
  }

  // 6. Demo progress history (rebuild so re-running stays idempotent).
  await prisma.progress.deleteMany({ where: { studentId: student.id } });
  await prisma.progress.createMany({
    data: SEED_PROGRESS.map((entry) => ({
      studentId: student.id,
      date: dateWeeksAgo(entry.weeksAgo),
      weightKg: entry.weightKg,
      bodyFatPct: entry.bodyFatPct,
      chestCm: entry.chestCm,
      armCm: entry.armCm,
      waistCm: entry.waistCm,
      shoulderCm: entry.shoulderCm,
      quadsCm: entry.quadsCm,
      calfCm: entry.calfCm,
      glutesCm: entry.glutesCm,
      targetCalories: entry.targetCalories,
      achievedCalories: entry.achievedCalories,
      notes: entry.notes,
    })),
  });

  console.log(
    `Seeded ${EXERCISE_CATALOG.length} catalog exercises, ` +
      `${SEED_ROUTINES.length} routines (${totalPrescriptions} prescriptions) and ` +
      `${SEED_PROGRESS.length} progress entries for student ${student.id}.`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
