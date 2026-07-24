/* Mobvex Trainer — data layer: DB row ↔ UI shape mappers, app vocabularies
   and the shared in-memory caches the hooks hydrate after each fetch.
   Routines and student progress are still mock while their DB wiring lands. */

import type {
  Exercise as DbExercise,
  Goal as DbGoal,
  MealHue,
  MealIcon,
  NewExercise,
  NewRecipe,
  NewRecipeItemLine,
  NutritionPlan,
  RecipeWithItems,
  StudentWithUser,
} from "@mobvex/db";
import type {
  CatalogExercise,
  DayKey,
  Diet,
  DietMeal,
  DietMealOption,
  EquipmentOption,
  GoalKey,
  Hue,
  HueKey,
  IngredientUnit,
  Macros,
  MealCategory,
  MealSlot,
  MuscleGroup,
  NewExercisePayload,
  NewRecipePayload,
  NewStudentPayload,
  Recipe,
  RecipeIngredient,
  Routine,
  Student,
} from "./types";

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

/* ---- Exercise repository (Ejercicios screen) ---- */
export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Tren inferior",
  "Empuje",
  "Tirón",
  "Core y cardio",
];

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  "Peso corporal",
  "Barra",
  "Mancuerna",
  "Máquina",
  "Polea",
  "Banda",
];

/* Shapes a DB exercises row for the Ejercicios screen. Rows whose
   muscle_group/equipment fall outside the app vocabularies (e.g. data
   predating the Spanish buckets) fall back to a bucket instead of silently
   vanishing from the grouped UI. */
export function exerciseFromDb(row: DbExercise): CatalogExercise {
  return {
    id: row.id,
    name: row.name,
    muscle: (MUSCLE_GROUPS as string[]).includes(row.muscle_group ?? "")
      ? (row.muscle_group as MuscleGroup)
      : "Core y cardio",
    equipment: (EQUIPMENT_OPTIONS as string[]).includes(row.equipment ?? "")
      ? (row.equipment as EquipmentOption)
      : "Peso corporal",
    mediaUrl: row.media_url ?? undefined,
    mediaTitle: row.media_title ?? undefined,
    mediaThumbnailUrl: row.media_thumbnail_url ?? undefined,
  };
}

/* Shapes the exercise form payload into a DB insert/update row, owned by the
   given trainer. */
export function exercisePayloadToDb(
  payload: NewExercisePayload,
  trainerId: string,
): NewExercise {
  return {
    trainer_id: trainerId,
    name: payload.name.trim(),
    muscle_group: payload.muscle,
    equipment: payload.equipment,
    media_url: payload.mediaUrl || null,
    media_title: payload.mediaTitle || null,
    media_thumbnail_url: payload.mediaThumbnailUrl || null,
  };
}

/* ---- Mobvex recipe library (Dietas screen + diet builder) ---- */
export const MEAL_CATEGORIES: MealCategory[] = [
  "Desayuno",
  "Almuerzo",
  "Cena",
  "Snacks",
];

/* DB-hydrated recipe library. useRecipes replaces the contents after each
   fetch so recipeById lookups (diet builder, student diet card) resolve the
   same recipes within a session. */
export const RECIPES: Recipe[] = [];

/* Replaces the in-memory library with the DB-backed list. */
export function hydrateRecipes(recipes: Recipe[]): void {
  RECIPES.splice(0, RECIPES.length, ...recipes);
}

export function recipeById(id: string | null): Recipe | undefined {
  if (!id) return undefined;
  return RECIPES.find((r) => r.id === id);
}

/* Approx macros per 100 g / 100 ml for common ingredients — used to estimate
   a recipe's totals as the trainer builds the ingredient list. */
export const INGREDIENT_DB: Record<string, Macros> = {
  "Pechuga de pollo": { kcal: 165, p: 31, c: 0, f: 3.6 },
  "Arroz blanco": { kcal: 130, p: 2.7, c: 28, f: 0.3 },
  "Arroz integral": { kcal: 123, p: 2.6, c: 26, f: 1 },
  Quinoa: { kcal: 120, p: 4.4, c: 21, f: 1.9 },
  Huevo: { kcal: 155, p: 13, c: 1.1, f: 11 },
  Avena: { kcal: 389, p: 17, c: 66, f: 7 },
  Salmón: { kcal: 208, p: 20, c: 0, f: 13 },
  Aguacate: { kcal: 160, p: 2, c: 9, f: 15 },
  Espinaca: { kcal: 23, p: 2.9, c: 3.6, f: 0.4 },
  "Yogur griego": { kcal: 97, p: 9, c: 3.6, f: 5 },
  Plátano: { kcal: 89, p: 1.1, c: 23, f: 0.3 },
  Almendras: { kcal: 579, p: 21, c: 22, f: 50 },
  Batata: { kcal: 86, p: 1.6, c: 20, f: 0.1 },
  Brócoli: { kcal: 34, p: 2.8, c: 7, f: 0.4 },
  Tofu: { kcal: 76, p: 8, c: 1.9, f: 4.8 },
  "Carne molida": { kcal: 250, p: 26, c: 0, f: 17 },
  Leche: { kcal: 42, p: 3.4, c: 5, f: 1 },
  Miel: { kcal: 304, p: 0.3, c: 82, f: 0 },
  "Aceite de oliva": { kcal: 884, p: 0, c: 0, f: 100 },
  "Frijoles negros": { kcal: 132, p: 8.9, c: 24, f: 0.5 },
};

export const INGREDIENT_NAMES = Object.keys(INGREDIENT_DB);

export const INGREDIENT_UNITS: IngredientUnit[] = [
  "gr",
  "ml",
  "ud",
  "reb",
  "cucharada",
  "libre",
];

/* Rough gram equivalents for macro estimation; "libre" contributes nothing. */
const UNIT_TO_GRAMS: Record<IngredientUnit, number> = {
  gr: 1,
  ml: 1,
  ud: 120,
  reb: 30,
  cucharada: 15,
  libre: 0,
};

/* Estimated macros for a quantity of one ingredient; zeros when unknown. */
export function macrosFor(
  name: string,
  qty: number,
  unit: IngredientUnit,
): Macros {
  const db = INGREDIENT_DB[name];
  if (!db || !qty) return { kcal: 0, p: 0, c: 0, f: 0 };
  const factor = (qty * UNIT_TO_GRAMS[unit]) / 100;
  return {
    kcal: db.kcal * factor,
    p: db.p * factor,
    c: db.c * factor,
    f: db.f * factor,
  };
}

/* Category hue per meal — DECORATIVE only (recipe icons), never CTAs/status. */
const MEAL_CATEGORY_HUE: Record<MealCategory, HueKey> = {
  Desayuno: "orange",
  Almuerzo: "green",
  Cena: "purple",
  Snacks: "blue",
};

/* Shapes a recipe_items/meal_recipe_items row (both share food/qty_value/unit)
   into the UI's ingredient shape, falling back to "gr" for unrecognized units
   instead of dropping the line. Shared by recipeFromDb (catalog recipes) and
   dietFromDb (per-student meal option portions). */
function itemsToIngredients(
  items: Array<{ food: string; qty_value?: number; unit?: string }>,
): RecipeIngredient[] {
  return items.map((item) => ({
    name: item.food,
    qty: item.qty_value ?? 0,
    unit: (INGREDIENT_UNITS as string[]).includes(item.unit ?? "")
      ? (item.unit as IngredientUnit)
      : "gr",
  }));
}

/* Shapes a DB recipes row (with template items) for the Dietas screen and
   diet builder. Rows whose meal category falls outside the app's buckets
   land in Snacks instead of vanishing from the grouped UI. */
export function recipeFromDb(row: RecipeWithItems): Recipe {
  const meal = (MEAL_CATEGORIES as string[]).includes(row.meal ?? "")
    ? (row.meal as MealCategory)
    : "Snacks";
  return {
    id: row.id,
    name: row.name,
    cat: MEAL_CATEGORY_HUE[meal],
    kcal: row.kcal,
    p: row.protein_g ?? 0,
    c: row.carbs_g ?? 0,
    f: row.fat_g ?? 0,
    time: row.prep_minutes ?? 0,
    tag: meal,
    meal,
    imageUrl: row.image_url ?? undefined,
    ingredients: itemsToIngredients(row.recipe_items),
  };
}

/* Display string for a recipe item ("200 g", "1 ud", "libre") — the mobile
   plan view renders it as-is. */
function formatItemQty(qty: number, unit: IngredientUnit): string {
  if (unit === "libre") return "libre";
  return `${qty} ${unit === "gr" ? "g" : unit}`;
}

/* Shapes the recipe form payload into a DB insert (header + item lines),
   owned by the given trainer. */
export function recipePayloadToDb(
  payload: NewRecipePayload,
  trainerId: string,
): { recipe: NewRecipe; items: NewRecipeItemLine[] } {
  return {
    recipe: {
      trainer_id: trainerId,
      name: payload.name.trim(),
      meal: payload.meal,
      kcal: Math.round(payload.totals.kcal),
      protein_g: Math.round(payload.totals.p),
      carbs_g: Math.round(payload.totals.c),
      fat_g: Math.round(payload.totals.f),
      image_url: payload.imageUrl || null,
    },
    items: payload.ingredients.map((ingredient, index) => ({
      food: ingredient.name,
      qty: formatItemQty(ingredient.qty, ingredient.unit),
      qty_value: ingredient.qty,
      unit: ingredient.unit,
      order: index,
    })),
  };
}

/* ---- Diets: comidas del día compuestas con recetas Mobvex ---- */
export const MEAL_SLOTS: MealSlot[] = ["Desayuno", "Comida", "Cena", "Snack"];

/* Presentation defaults for the meals a trainer-built plan creates. */
export const MEAL_SLOT_META: Record<
  MealSlot,
  { time: string; icon: MealIcon; hue: MealHue }
> = {
  Desayuno: { time: "07:30", icon: "utensils", hue: "orange" },
  Comida: { time: "13:30", icon: "utensils", hue: "green" },
  Cena: { time: "20:30", icon: "utensils", hue: "purple" },
  Snack: { time: "17:00", icon: "droplet", hue: "pink" },
};

/* Fallback daily targets while a plan (or its targets) doesn't exist yet. */
export const DEFAULT_DIET_TARGET = { kcal: 2100, p: 150 } as const;

/* Which recipe catalog category each UI meal slot draws its "add option"
   suggestions from by default (e.g. only Almuerzo recipes for the Comida
   slot). Names differ (UI slots use the day's Spanish meal names; the
   catalog's meal categories use "Almuerzo"/"Snacks") so this isn't 1:1. */
export const SLOT_TO_MEAL_CATEGORY: Record<MealSlot, MealCategory> = {
  Desayuno: "Desayuno",
  Comida: "Almuerzo",
  Cena: "Cena",
  Snack: "Snacks",
};

/* Shapes a DB nutrition plan for the trainer UI: each meal row carries its
   own slot name (set at save time), so slots map onto the UI by that name —
   NOT by array position. Rows are skipped entirely when they have no recipe
   options (see useDiet.ts's save()), so `plan.meals` is compacted rather
   than sparse; assuming position === slot order would misalign every slot
   after the first gap. Each slot holds the trainer's recipe options
   (ordered, each with its per-student ingredient portions) and the
   student's selected one, falling back to the first option. */
export function dietFromDb(plan: NutritionPlan): Diet {
  const meals: Record<MealSlot, DietMeal> = {
    Desayuno: { options: [], selected: null },
    Comida: { options: [], selected: null },
    Cena: { options: [], selected: null },
    Snack: { options: [], selected: null },
  };
  plan.meals.forEach((meal) => {
    const slot = (MEAL_SLOTS as string[]).includes(meal.name)
      ? (meal.name as MealSlot)
      : undefined;
    if (!slot) return; // unrecognized/legacy row — skip rather than guess
    const options: DietMealOption[] = meal.meal_recipes.map((option) => ({
      recipeId: option.recipe_id,
      ingredients: itemsToIngredients(option.meal_recipe_items),
    }));
    meals[slot] = {
      options,
      selected: meal.selected_recipe_id ?? options[0]?.recipeId ?? null,
    };
  });
  return {
    name: plan.name,
    target: {
      kcal: plan.target_calories ?? DEFAULT_DIET_TARGET.kcal,
      p: plan.protein_g ?? DEFAULT_DIET_TARGET.p,
    },
    meals,
  };
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
