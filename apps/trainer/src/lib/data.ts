/* Mobvex Trainer — mock data.
   Trainer, students, their progress, routines, diets; plus the Mobvex
   recipe library used to compose diets. All user-facing copy in Spanish. */

import type { Goal as DbGoal, StudentWithUser } from "@mobvex/db";
import type {
  DayKey,
  Diet,
  GoalKey,
  Hue,
  HueKey,
  MealSlot,
  NewStudentPayload,
  Recipe,
  Routine,
  Student,
} from "./types";

export const TRAINER = {
  name: "Carlos Vega",
  role: "Entrenador personal",
  email: "carlos@mobvex.app",
} as const;

/* Category hue per goal — DECORATIVE only (goal tags), never on CTAs/status. */
export const GOAL_HUE: Record<GoalKey, HueKey> = {
  "Pérdida de grasa": "purple",
  Hipertrofia: "blue",
  Fuerza: "orange",
  Recomposición: "pink",
  Mantenimiento: "green",
};

export const HUE: Record<HueKey, Hue> = {
  purple: {
    solid: "var(--cat-purple-solid)",
    bg: "var(--cat-purple-bg)",
    border: "var(--cat-purple-border)",
  },
  blue: {
    solid: "var(--cat-blue-solid)",
    bg: "var(--cat-blue-bg)",
    border: "var(--cat-blue-border)",
  },
  orange: {
    solid: "var(--cat-orange-solid)",
    bg: "var(--cat-orange-bg)",
    border: "var(--cat-orange-border)",
  },
  pink: {
    solid: "var(--cat-pink-solid)",
    bg: "var(--cat-pink-bg)",
    border: "var(--cat-pink-border)",
  },
  green: {
    solid: "var(--cat-green-solid)",
    bg: "var(--cat-green-bg)",
    border: "var(--cat-green-border)",
  },
};

/* 7-day workout adherence (true = completed session) */
const wk = (s: string): boolean[] => s.split("").map((c) => c === "1");

export const STUDENTS: Student[] = [
  {
    id: "ava",
    name: "Ava Cole",
    goal: "Pérdida de grasa",
    since: "Mar 2026",
    nextSession: "Hoy · 18:30",
    adherence: 92,
    streak: 14,
    status: "ontrack",
    weight: [68.4, 67.6, 67.1, 66.3, 65.8, 65.0, 64.4, 63.9],
    startWeight: 68.4,
    targetWeight: 62.0,
    bodyFat: 24.1,
    bodyFatStart: 28.0,
    metrics: { cintura: 74, pecho: 92, brazo: 29 },
    week: wk("1101101"),
  },
  {
    id: "marcos",
    name: "Marcos Ruiz",
    goal: "Hipertrofia",
    since: "Ene 2026",
    nextSession: "Mañana · 07:00",
    adherence: 78,
    streak: 6,
    status: "ontrack",
    weight: [74.0, 74.3, 74.9, 75.2, 75.8, 76.1, 76.6, 77.0],
    startWeight: 74.0,
    targetWeight: 80.0,
    bodyFat: 15.2,
    bodyFatStart: 16.0,
    metrics: { cintura: 81, pecho: 104, brazo: 38 },
    week: wk("1010110"),
  },
  {
    id: "lucia",
    name: "Lucía Fernández",
    goal: "Fuerza",
    since: "Nov 2025",
    nextSession: "Jue · 19:00",
    adherence: 88,
    streak: 9,
    status: "ontrack",
    weight: [61.0, 61.2, 61.0, 61.5, 61.8, 61.6, 62.0, 62.1],
    startWeight: 61.0,
    targetWeight: 63.0,
    bodyFat: 21.0,
    bodyFatStart: 22.5,
    metrics: { cintura: 70, pecho: 88, brazo: 30 },
    week: wk("1101011"),
  },
  {
    id: "diego",
    name: "Diego Santos",
    goal: "Recomposición",
    since: "Feb 2026",
    nextSession: "Sin programar",
    adherence: 54,
    streak: 0,
    status: "attention",
    weight: [82.0, 81.6, 81.9, 81.4, 81.7, 81.2, 81.5, 81.3],
    startWeight: 82.0,
    targetWeight: 78.0,
    bodyFat: 22.4,
    bodyFatStart: 23.0,
    metrics: { cintura: 89, pecho: 101, brazo: 35 },
    week: wk("1000100"),
  },
  {
    id: "sara",
    name: "Sara Moreno",
    goal: "Pérdida de grasa",
    since: "Dic 2025",
    nextSession: "Hoy · 12:00",
    adherence: 95,
    streak: 21,
    status: "ontrack",
    weight: [70.2, 69.4, 68.5, 67.9, 67.0, 66.4, 65.7, 65.0],
    startWeight: 70.2,
    targetWeight: 63.0,
    bodyFat: 26.0,
    bodyFatStart: 30.5,
    metrics: { cintura: 76, pecho: 94, brazo: 28 },
    week: wk("1111101"),
  },
  {
    id: "javier",
    name: "Javier Niño",
    goal: "Hipertrofia",
    since: "Mar 2026",
    nextSession: "Vie · 17:30",
    adherence: 71,
    streak: 4,
    status: "ontrack",
    weight: [69.0, 69.2, 69.5, 69.4, 69.9, 70.1, 70.0, 70.4],
    startWeight: 69.0,
    targetWeight: 75.0,
    bodyFat: 14.0,
    bodyFatStart: 14.8,
    metrics: { cintura: 78, pecho: 98, brazo: 34 },
    week: wk("1010100"),
  },
  {
    id: "elena",
    name: "Elena Vidal",
    goal: "Mantenimiento",
    since: "Oct 2025",
    nextSession: "Sáb · 10:00",
    adherence: 84,
    streak: 11,
    status: "ontrack",
    weight: [58.5, 58.6, 58.4, 58.5, 58.3, 58.5, 58.4, 58.5],
    startWeight: 58.5,
    targetWeight: 58.0,
    bodyFat: 19.5,
    bodyFatStart: 20.0,
    metrics: { cintura: 68, pecho: 86, brazo: 27 },
    week: wk("1101101"),
  },
  {
    id: "diana",
    name: "Diana Pérez",
    goal: "Fuerza",
    since: "Feb 2026",
    nextSession: "Lun · 18:00",
    adherence: 67,
    streak: 3,
    status: "attention",
    weight: [64.0, 64.1, 64.3, 64.2, 64.5, 64.4, 64.6, 64.7],
    startWeight: 64.0,
    targetWeight: 66.0,
    bodyFat: 23.0,
    bodyFatStart: 23.8,
    metrics: { cintura: 72, pecho: 90, brazo: 29 },
    week: wk("1100100"),
  },
];

/* ---- Routines: weekly split (día → ejercicios) ---- */
export const DAYS: DayKey[] = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const ROUTINE_BY_ID: Record<string, Routine> = {
  ava: {
    name: "Definición · 5 días",
    days: {
      Lun: {
        focus: "Tren superior",
        ex: [
          { name: "Press banca mancuerna", sets: 4, reps: "12", kg: 14 },
          { name: "Remo con barra", sets: 4, reps: "12", kg: 30 },
          { name: "Press militar", sets: 3, reps: "12", kg: 18 },
          { name: "Face pull", sets: 3, reps: "15", kg: 20 },
        ],
      },
      Mar: {
        focus: "Tren inferior",
        ex: [
          { name: "Sentadilla goblet", sets: 4, reps: "12", kg: 20 },
          { name: "Peso muerto rumano", sets: 4, reps: "10", kg: 40 },
          { name: "Zancadas", sets: 3, reps: "12", kg: 12 },
          { name: "Elevación de gemelo", sets: 4, reps: "15", kg: 30 },
        ],
      },
      Mié: {
        focus: "Cardio + core",
        ex: [
          { name: "HIIT cinta", sets: 1, reps: "20 min", kg: 0 },
          { name: "Plancha", sets: 4, reps: "45 s", kg: 0 },
          { name: "Crunch en polea", sets: 4, reps: "15", kg: 25 },
        ],
      },
      Jue: {
        focus: "Empuje",
        ex: [
          { name: "Press inclinado", sets: 4, reps: "10", kg: 16 },
          { name: "Aperturas", sets: 3, reps: "15", kg: 8 },
          { name: "Fondos asistidos", sets: 3, reps: "12", kg: 0 },
          { name: "Extensión de tríceps", sets: 3, reps: "15", kg: 14 },
        ],
      },
      Vie: {
        focus: "Tirón",
        ex: [
          { name: "Jalón al pecho", sets: 4, reps: "12", kg: 35 },
          { name: "Remo sentado", sets: 4, reps: "12", kg: 32 },
          { name: "Curl bíceps", sets: 3, reps: "12", kg: 10 },
          { name: "Pájaros", sets: 3, reps: "15", kg: 6 },
        ],
      },
      Sáb: null,
      Dom: null,
    },
  },
};

/* default skeleton routine for students without a detailed plan */
function defaultRoutine(): Routine {
  return {
    name: "Full body · 3 días",
    days: {
      Lun: {
        focus: "Full body A",
        ex: [
          { name: "Sentadilla", sets: 4, reps: "10", kg: 40 },
          { name: "Press banca", sets: 4, reps: "10", kg: 30 },
          { name: "Remo con barra", sets: 3, reps: "12", kg: 30 },
        ],
      },
      Mar: null,
      Mié: {
        focus: "Full body B",
        ex: [
          { name: "Peso muerto", sets: 4, reps: "8", kg: 60 },
          { name: "Press militar", sets: 4, reps: "10", kg: 20 },
          { name: "Dominadas asistidas", sets: 3, reps: "10", kg: 0 },
        ],
      },
      Jue: null,
      Vie: {
        focus: "Full body C",
        ex: [
          { name: "Prensa", sets: 4, reps: "12", kg: 90 },
          { name: "Press inclinado", sets: 4, reps: "10", kg: 22 },
          { name: "Curl + extensión", sets: 3, reps: "15", kg: 12 },
        ],
      },
      Sáb: null,
      Dom: null,
    },
  };
}

export function routineFor(id: string): Routine {
  return ROUTINE_BY_ID[id] ?? defaultRoutine();
}

/* ---- Mobvex recipe library (for diet builder) ---- */
export const RECIPES: Recipe[] = [
  { id: "r1", name: "Bowl de salmón y miso", cat: "blue", kcal: 540, p: 34, c: 42, f: 24, time: 20, tag: "Alto en proteína" },
  { id: "r2", name: "Avena proteica y frutos rojos", cat: "pink", kcal: 380, p: 24, c: 52, f: 9, time: 8, tag: "Desayuno" },
  { id: "r3", name: "Pollo teriyaki con arroz", cat: "orange", kcal: 610, p: 45, c: 60, f: 14, time: 25, tag: "Alto en proteína" },
  { id: "r4", name: "Ensalada César con pollo", cat: "green", kcal: 420, p: 38, c: 18, f: 22, time: 15, tag: "Bajo en carbos" },
  { id: "r5", name: "Tofu salteado y verduras", cat: "purple", kcal: 360, p: 22, c: 34, f: 14, time: 18, tag: "Vegetariano" },
  { id: "r6", name: "Wrap de pavo y aguacate", cat: "green", kcal: 450, p: 32, c: 38, f: 18, time: 10, tag: "Rápido" },
  { id: "r7", name: "Tortilla de claras y espinaca", cat: "pink", kcal: 290, p: 28, c: 8, f: 16, time: 12, tag: "Desayuno" },
  { id: "r8", name: "Curry de garbanzos", cat: "orange", kcal: 480, p: 19, c: 64, f: 16, time: 30, tag: "Vegano" },
  { id: "r9", name: "Yogur griego, nueces y miel", cat: "blue", kcal: 260, p: 18, c: 22, f: 12, time: 4, tag: "Snack" },
  { id: "r10", name: "Merluza al horno y brócoli", cat: "blue", kcal: 340, p: 36, c: 14, f: 14, time: 22, tag: "Bajo en carbos" },
  { id: "r11", name: "Batido de plátano y proteína", cat: "purple", kcal: 310, p: 30, c: 38, f: 5, time: 3, tag: "Post-entreno" },
  { id: "r12", name: "Ternera magra con quinoa", cat: "orange", kcal: 560, p: 42, c: 48, f: 20, time: 28, tag: "Alto en proteína" },
];

export function recipeById(id: string | null): Recipe | undefined {
  if (!id) return undefined;
  return RECIPES.find((r) => r.id === id);
}

/* ---- Diets: comidas del día compuestas con recetas Mobvex ---- */
export const MEAL_SLOTS: MealSlot[] = ["Desayuno", "Comida", "Cena", "Snack"];

const DIET_BY_ID: Record<string, Diet> = {
  ava: {
    name: "Déficit moderado",
    target: { kcal: 1800, p: 130 },
    meals: { Desayuno: "r2", Comida: "r4", Cena: "r10", Snack: "r9" },
  },
};

function defaultDiet(): Diet {
  return {
    name: "Plan equilibrado",
    target: { kcal: 2100, p: 150 },
    meals: { Desayuno: "r7", Comida: "r3", Cena: "r1", Snack: "r11" },
  };
}

export function dietFor(id: string): Diet {
  return DIET_BY_ID[id] ?? defaultDiet();
}

export function studentById(id: string | null): Student | undefined {
  if (!id) return undefined;
  return STUDENTS.find((s) => s.id === id);
}

const MONTHS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
] as const;

function monthYear(date: Date): string {
  return `${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;
}

/* Freshly-onboarded defaults for fields no real data exists for yet
   (adherence, sessions, measurements come from future progress data). */
function buildStudent(
  id: string,
  name: string,
  email: string,
  goal: GoalKey,
  since: string,
): Student {
  const startWeight = 70;
  return {
    id,
    name,
    email,
    goal,
    since,
    nextSession: "Sin programar",
    adherence: 0,
    streak: 0,
    status: "ontrack",
    weight: Array<number>(8).fill(startWeight),
    startWeight,
    targetWeight: startWeight,
    bodyFat: 20,
    bodyFatStart: 20,
    metrics: { cintura: 0, pecho: 0, brazo: 0 },
    week: Array<boolean>(7).fill(false),
  };
}

/* The DB Goal enum → the UI's coaching-goal labels (nearest match for
   values the trainer UI does not emit itself). */
export const DB_TO_GOAL: Record<DbGoal, GoalKey> = {
  fat_loss: "Pérdida de grasa",
  hypertrophy: "Hipertrofia",
  muscle_gain: "Hipertrofia",
  force: "Fuerza",
  performance: "Fuerza",
  maintenance: "Mantenimiento",
  general_health: "Mantenimiento",
};

/* Shapes a DB students row (with joined user profile) for roster display.
   The joined user can come back null if RLS hides the profile row. */
export function studentFromDb(row: StudentWithUser): Student {
  return buildStudent(
    row.id,
    row.user?.name ?? "Alumno",
    row.user?.email ?? "",
    DB_TO_GOAL[row.goal],
    monthYear(new Date(row.created_at)),
  );
}

/* Replaces the in-memory roster with the DB-backed list so lookups made by
   other screens (studentById → ficha, routine/diet defaults) keep working. */
export function hydrateStudents(students: Student[]): void {
  STUDENTS.splice(0, STUDENTS.length, ...students);
}

/* Adds a freshly-created student (from the New student form) to the roster
   with sane, freshly-onboarded defaults. Returns the new student's id. */
export function createStudent({ name, email, goal }: NewStudentPayload): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const base = slug || "alumno";
  const id = STUDENTS.some((s) => s.id === base)
    ? `${base}-${STUDENTS.length + 1}`
    : base;

  STUDENTS.push(
    buildStudent(id, name.trim(), email, goal, monthYear(new Date())),
  );
  return id;
}
