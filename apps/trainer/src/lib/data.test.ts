import { beforeEach, describe, expect, it } from "vitest";
import type { NutritionPlan, RecipeWithItems, StudentWithUser } from "@mobvex/db";
import {
  createStudent,
  dietFromDb,
  DEFAULT_DIET_TARGET,
  exerciseFromDb,
  exercisePayloadToDb,
  hydrateStudents,
  macrosFor,
  recipeFromDb,
  recipePayloadToDb,
  routineFor,
  STUDENTS,
  studentById,
  studentFromDb,
} from "./data";

describe("macrosFor", () => {
  it("scales a known ingredient's macros to the given quantity", () => {
    // Pechuga de pollo is 165 kcal / 31 p / 0 c / 3.6 f per 100 g
    expect(macrosFor("Pechuga de pollo", 200, "gr")).toEqual({
      kcal: 330,
      p: 62,
      c: 0,
      f: 7.2,
    });
  });

  it("returns zeros for an unknown ingredient", () => {
    expect(macrosFor("Unicornio", 100, "gr")).toEqual({
      kcal: 0,
      p: 0,
      c: 0,
      f: 0,
    });
  });

  it("returns zeros when quantity is zero", () => {
    expect(macrosFor("Pechuga de pollo", 0, "gr")).toEqual({
      kcal: 0,
      p: 0,
      c: 0,
      f: 0,
    });
  });

  it("treats 'libre' units as contributing no grams", () => {
    expect(macrosFor("Aceite de oliva", 3, "libre")).toEqual({
      kcal: 0,
      p: 0,
      c: 0,
      f: 0,
    });
  });
});

describe("exerciseFromDb", () => {
  const baseRow = {
    id: "ex-1",
    name: "Sentadilla",
    muscle_group: "Tren inferior",
    equipment: "Barra",
    media_url: null,
    media_title: null,
    media_thumbnail_url: null,
  } as unknown as Parameters<typeof exerciseFromDb>[0];

  it("passes through recognized muscle group and equipment", () => {
    expect(exerciseFromDb(baseRow)).toEqual({
      id: "ex-1",
      name: "Sentadilla",
      muscle: "Tren inferior",
      equipment: "Barra",
      mediaUrl: undefined,
      mediaTitle: undefined,
      mediaThumbnailUrl: undefined,
    });
  });

  it("falls back to 'Core y cardio' / 'Peso corporal' for unrecognized values", () => {
    const row = {
      ...baseRow,
      muscle_group: "Legacy bucket",
      equipment: "Legacy equipment",
    } as unknown as Parameters<typeof exerciseFromDb>[0];

    const result = exerciseFromDb(row);
    expect(result.muscle).toBe("Core y cardio");
    expect(result.equipment).toBe("Peso corporal");
  });

  it("maps media fields when present", () => {
    const row = {
      ...baseRow,
      media_url: "https://youtu.be/xyz",
      media_title: "Cómo hacer sentadillas",
      media_thumbnail_url: "https://img/thumb.jpg",
    } as unknown as Parameters<typeof exerciseFromDb>[0];

    const result = exerciseFromDb(row);
    expect(result.mediaUrl).toBe("https://youtu.be/xyz");
    expect(result.mediaTitle).toBe("Cómo hacer sentadillas");
    expect(result.mediaThumbnailUrl).toBe("https://img/thumb.jpg");
  });
});

describe("exercisePayloadToDb", () => {
  it("trims the name and nulls out empty optional media fields", () => {
    const result = exercisePayloadToDb(
      {
        name: "  Press banca  ",
        muscle: "Empuje",
        equipment: "Barra",
        mediaUrl: "",
        mediaTitle: "",
        mediaThumbnailUrl: "",
      },
      "trainer-1",
    );

    expect(result).toEqual({
      trainer_id: "trainer-1",
      name: "Press banca",
      muscle_group: "Empuje",
      equipment: "Barra",
      media_url: null,
      media_title: null,
      media_thumbnail_url: null,
    });
  });
});

describe("recipeFromDb", () => {
  const baseRow = {
    id: "r-1",
    name: "Bowl de pollo",
    meal: "Almuerzo",
    kcal: 500,
    protein_g: 40,
    carbs_g: 50,
    fat_g: 10,
    prep_minutes: 20,
    image_url: null,
    recipe_items: [{ food: "Pechuga de pollo", qty_value: 200, unit: "gr" }],
  } as unknown as RecipeWithItems;

  it("maps a recognized meal category and its ingredients", () => {
    const recipe = recipeFromDb(baseRow);
    expect(recipe.meal).toBe("Almuerzo");
    expect(recipe.tag).toBe("Almuerzo");
    expect(recipe.cat).toBe("green");
    expect(recipe.ingredients).toEqual([
      { name: "Pechuga de pollo", qty: 200, unit: "gr" },
    ]);
  });

  it("falls back to 'Snacks' for an unrecognized meal category", () => {
    const row = { ...baseRow, meal: "Postre" } as unknown as RecipeWithItems;
    const recipe = recipeFromDb(row);
    expect(recipe.meal).toBe("Snacks");
    expect(recipe.tag).toBe("Snacks");
  });

  it("falls back to 'gr' for an unrecognized ingredient unit", () => {
    const row = {
      ...baseRow,
      recipe_items: [{ food: "Huevo", qty_value: 2, unit: "cajas" }],
    } as unknown as RecipeWithItems;
    const recipe = recipeFromDb(row);
    expect(recipe.ingredients).toEqual([{ name: "Huevo", qty: 2, unit: "gr" }]);
  });
});

describe("recipePayloadToDb", () => {
  it("rounds macro totals and formats ingredient quantities", () => {
    const { recipe, items } = recipePayloadToDb(
      {
        name: "  Bowl fit  ",
        meal: "Cena",
        imageUrl: "",
        ingredients: [{ name: "Quinoa", qty: 150, unit: "gr" }],
        totals: { kcal: 199.6, p: 12.4, c: 30.5, f: 4.49 },
      },
      "trainer-1",
    );

    expect(recipe).toEqual({
      trainer_id: "trainer-1",
      name: "Bowl fit",
      meal: "Cena",
      kcal: 200,
      protein_g: 12,
      carbs_g: 31,
      fat_g: 4,
      image_url: null,
    });
    expect(items).toEqual([
      { food: "Quinoa", qty: "150 g", qty_value: 150, unit: "gr", order: 0 },
    ]);
  });

  it("formats 'libre' quantities without a numeric amount", () => {
    const { items } = recipePayloadToDb(
      {
        name: "Ensalada",
        meal: "Almuerzo",
        ingredients: [{ name: "Espinaca", qty: 0, unit: "libre" }],
        totals: { kcal: 0, p: 0, c: 0, f: 0 },
      },
      "trainer-1",
    );
    expect(items[0]?.qty).toBe("libre");
  });
});

describe("dietFromDb", () => {
  const basePlan = {
    name: "Plan definición",
    target_calories: 1800,
    protein_g: 140,
    meals: [
      {
        name: "Desayuno",
        selected_recipe_id: null,
        meal_recipes: [
          {
            recipe_id: "r-1",
            meal_recipe_items: [{ food: "Avena", qty_value: 60, unit: "gr" }],
          },
        ],
      },
    ],
  } as unknown as NutritionPlan;

  it("maps recognized meal slots and falls back selected to the first option", () => {
    const diet = dietFromDb(basePlan);
    expect(diet.name).toBe("Plan definición");
    expect(diet.target).toEqual({ kcal: 1800, p: 140 });
    expect(diet.meals.Desayuno.selected).toBe("r-1");
    expect(diet.meals.Desayuno.options).toEqual([
      { recipeId: "r-1", ingredients: [{ name: "Avena", qty: 60, unit: "gr" }] },
    ]);
    expect(diet.meals.Comida).toEqual({ options: [], selected: null });
  });

  it("skips meal rows with an unrecognized slot name", () => {
    const plan = {
      ...basePlan,
      meals: [{ name: "Merienda", selected_recipe_id: null, meal_recipes: [] }],
    } as unknown as NutritionPlan;
    const diet = dietFromDb(plan);
    expect(diet.meals.Desayuno).toEqual({ options: [], selected: null });
  });

  it("falls back to the app defaults when target fields are missing", () => {
    const plan = {
      ...basePlan,
      target_calories: null,
      protein_g: null,
    } as unknown as NutritionPlan;
    const diet = dietFromDb(plan);
    expect(diet.target).toEqual(DEFAULT_DIET_TARGET);
  });
});

describe("studentFromDb", () => {
  it("maps a joined user profile onto the roster shape", () => {
    const row = {
      id: "s-1",
      goal: "fat_loss",
      created_at: "2026-01-15T00:00:00Z",
      user: { name: "Ana Gómez", email: "ana@mobvex.test" },
    } as unknown as StudentWithUser;

    const student = studentFromDb(row);
    expect(student.id).toBe("s-1");
    expect(student.name).toBe("Ana Gómez");
    expect(student.email).toBe("ana@mobvex.test");
    expect(student.goal).toBe("Pérdida de grasa");
  });

  it("falls back to defaults when RLS hides the joined user row", () => {
    const row = {
      id: "s-2",
      goal: "hypertrophy",
      created_at: "2026-01-15T00:00:00Z",
      user: null,
    } as unknown as StudentWithUser;

    const student = studentFromDb(row);
    expect(student.name).toBe("Alumno");
    expect(student.email).toBe("");
    expect(student.goal).toBe("Hipertrofia");
  });
});

describe("createStudent / hydrateStudents / studentById", () => {
  beforeEach(() => {
    hydrateStudents([]);
  });

  it("keeps the STUDENTS array reference stable across hydration", () => {
    const previousRef = STUDENTS;
    hydrateStudents([
      studentFromDb({
        id: "s-1",
        goal: "fat_loss",
        created_at: "2026-01-15T00:00:00Z",
        user: { name: "Ana", email: "ana@mobvex.test" },
      } as unknown as StudentWithUser),
    ]);
    expect(STUDENTS).toBe(previousRef);
    expect(STUDENTS).toHaveLength(1);
  });

  it("slugifies the name into an id and adds the student to the roster", () => {
    const id = createStudent({
      name: "Camila Ruiz",
      email: "camila@mobvex.test",
      goal: "Fuerza",
    });
    expect(id).toBe("camila-ruiz");
    expect(studentById(id)).toMatchObject({
      id: "camila-ruiz",
      name: "Camila Ruiz",
      email: "camila@mobvex.test",
      goal: "Fuerza",
    });
  });

  it("falls back to 'alumno' when the name has no slug-able characters", () => {
    const id = createStudent({ name: "!!!", email: "x@mobvex.test", goal: "Fuerza" });
    expect(id).toBe("alumno");
  });

  it("disambiguates a slug collision with a numeric suffix", () => {
    const firstId = createStudent({
      name: "Camila Ruiz",
      email: "camila1@mobvex.test",
      goal: "Fuerza",
    });
    const secondId = createStudent({
      name: "Camila Ruiz",
      email: "camila2@mobvex.test",
      goal: "Fuerza",
    });
    expect(firstId).toBe("camila-ruiz");
    expect(secondId).toBe("camila-ruiz-2");
  });

  it("returns undefined for a null or unknown id", () => {
    expect(studentById(null)).toBeUndefined();
    expect(studentById("nope")).toBeUndefined();
  });
});

describe("routineFor", () => {
  it("returns the specific routine for a known student id", () => {
    expect(routineFor("ava").name).toBe("Definición · 5 días");
  });

  it("returns the default skeleton routine for an unknown id", () => {
    expect(routineFor("someone-new").name).toBe("Full body · 3 días");
  });
});
