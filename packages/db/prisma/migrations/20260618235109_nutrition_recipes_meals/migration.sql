-- Reusable recipe catalog + meal structure for nutrition plans.
-- (Additive only — progress_photos drift between schema and DB is left untouched.)

-- CreateTable
CREATE TABLE "recipes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trainer_id" UUID,
    "name" TEXT NOT NULL,
    "kcal" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipe_id" UUID NOT NULL,
    "food" TEXT NOT NULL,
    "qty" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "recipe_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nutrition_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "hue" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "selected_recipe_id" UUID,
    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_recipes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "meal_id" UUID NOT NULL,
    "recipe_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "meal_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recipes_trainer_id_idx" ON "recipes"("trainer_id");
CREATE INDEX "recipe_items_recipe_id_idx" ON "recipe_items"("recipe_id");
CREATE UNIQUE INDEX "recipe_items_recipe_id_order_key" ON "recipe_items"("recipe_id", "order");
CREATE INDEX "meals_nutrition_id_idx" ON "meals"("nutrition_id");
CREATE UNIQUE INDEX "meals_nutrition_id_order_key" ON "meals"("nutrition_id", "order");
CREATE INDEX "meal_recipes_meal_id_idx" ON "meal_recipes"("meal_id");
CREATE INDEX "meal_recipes_recipe_id_idx" ON "meal_recipes"("recipe_id");
CREATE UNIQUE INDEX "meal_recipes_meal_id_recipe_id_key" ON "meal_recipes"("meal_id", "recipe_id");
CREATE UNIQUE INDEX "meal_recipes_meal_id_order_key" ON "meal_recipes"("meal_id", "order");

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipe_items" ADD CONSTRAINT "recipe_items_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meals" ADD CONSTRAINT "meals_nutrition_id_fkey" FOREIGN KEY ("nutrition_id") REFERENCES "nutrition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meals" ADD CONSTRAINT "meals_selected_recipe_id_fkey" FOREIGN KEY ("selected_recipe_id") REFERENCES "recipes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "meal_recipes" ADD CONSTRAINT "meal_recipes_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "meal_recipes" ADD CONSTRAINT "meal_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
