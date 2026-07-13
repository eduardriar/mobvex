-- Per-student portions: a meal_recipes row (a recipe attached to a student's
-- meal) now carries its own macros, and its food lines are copied into the new
-- meal_recipe_items table so the trainer can adjust quantities per student
-- while recipes/recipe_items stay a reusable template.

-- AlterTable: kcal is added nullable, backfilled from the recipe below, then
-- tightened to NOT NULL (the table already has rows).
ALTER TABLE "meal_recipes" ADD COLUMN     "carbs_g" INTEGER,
ADD COLUMN     "fat_g" INTEGER,
ADD COLUMN     "kcal" INTEGER,
ADD COLUMN     "protein_g" INTEGER;

-- CreateTable
CREATE TABLE "meal_recipe_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meal_recipe_id" UUID NOT NULL,
    "food" TEXT NOT NULL,
    "qty" TEXT NOT NULL,
    "qty_value" DOUBLE PRECISION,
    "unit" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "meal_recipe_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "meal_recipe_items_meal_recipe_id_idx" ON "meal_recipe_items"("meal_recipe_id");

-- CreateIndex
CREATE UNIQUE INDEX "meal_recipe_items_meal_recipe_id_order_key" ON "meal_recipe_items"("meal_recipe_id", "order");

-- AddForeignKey
ALTER TABLE "meal_recipe_items" ADD CONSTRAINT "meal_recipe_items_meal_recipe_id_fkey" FOREIGN KEY ("meal_recipe_id") REFERENCES "meal_recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: existing assignments inherit the recipe's macros as their
-- per-student defaults...
UPDATE "meal_recipes" mr
SET kcal      = r.kcal,
    protein_g = r.protein_g,
    carbs_g   = r.carbs_g,
    fat_g     = r.fat_g
FROM "recipes" r
WHERE r.id = mr.recipe_id;

ALTER TABLE "meal_recipes" ALTER COLUMN "kcal" SET NOT NULL;

-- ...and a per-assignment copy of the recipe's food lines.
INSERT INTO "meal_recipe_items" (meal_recipe_id, food, qty, qty_value, unit, "order")
SELECT mr.id, ri.food, ri.qty, ri.qty_value, ri.unit, ri."order"
FROM "meal_recipes" mr
JOIN "recipe_items" ri ON ri.recipe_id = mr.recipe_id;
