-- AlterTable
ALTER TABLE "recipe_items" ADD COLUMN     "qty_value" DOUBLE PRECISION,
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "recipes" ADD COLUMN     "carbs_g" INTEGER,
ADD COLUMN     "fat_g" INTEGER,
ADD COLUMN     "meal" TEXT,
ADD COLUMN     "prep_minutes" INTEGER,
ADD COLUMN     "protein_g" INTEGER;

-- Backfill the seeded catalog recipes with meal category (the app's four
-- Spanish buckets; the seed plan's "Merienda" meal maps to "Snacks"),
-- estimated macros and prep time.
UPDATE "recipes" SET meal='Desayuno', protein_g=38, carbs_g=62, fat_g=12, prep_minutes=10 WHERE trainer_id IS NULL AND name='Avena y claras';
UPDATE "recipes" SET meal='Desayuno', protein_g=22, carbs_g=45, fat_g=24, prep_minutes=10 WHERE trainer_id IS NULL AND name='Tostadas y aguacate';
UPDATE "recipes" SET meal='Desayuno', protein_g=42, carbs_g=60, fat_g=8,  prep_minutes=5  WHERE trainer_id IS NULL AND name='Batido proteico';
UPDATE "recipes" SET meal='Almuerzo', protein_g=55, carbs_g=70, fat_g=18, prep_minutes=25 WHERE trainer_id IS NULL AND name='Pollo y arroz';
UPDATE "recipes" SET meal='Almuerzo', protein_g=48, carbs_g=65, fat_g=22, prep_minutes=30 WHERE trainer_id IS NULL AND name='Ternera y patata';
UPDATE "recipes" SET meal='Almuerzo', protein_g=50, carbs_g=60, fat_g=20, prep_minutes=25 WHERE trainer_id IS NULL AND name='Pescado y quinoa';
UPDATE "recipes" SET meal='Snacks',   protein_g=22, carbs_g=25, fat_g=14, prep_minutes=5  WHERE trainer_id IS NULL AND name='Yogur y frutos';
UPDATE "recipes" SET meal='Snacks',   protein_g=24, carbs_g=22, fat_g=12, prep_minutes=5  WHERE trainer_id IS NULL AND name='Tostada de pavo';
UPDATE "recipes" SET meal='Snacks',   protein_g=20, carbs_g=28, fat_g=12, prep_minutes=5  WHERE trainer_id IS NULL AND name='Fruta y requesón';
UPDATE "recipes" SET meal='Cena',     protein_g=40, carbs_g=40, fat_g=28, prep_minutes=25 WHERE trainer_id IS NULL AND name='Salmón y batata';
UPDATE "recipes" SET meal='Cena',     protein_g=32, carbs_g=15, fat_g=40, prep_minutes=15 WHERE trainer_id IS NULL AND name='Tortilla de verduras';
UPDATE "recipes" SET meal='Cena',     protein_g=52, carbs_g=12, fat_g=30, prep_minutes=20 WHERE trainer_id IS NULL AND name='Pollo y ensalada';

-- Best-effort structured backfill of item quantities from the display text.
-- The seed rebuilds all catalog items on every run; this keeps the DB
-- coherent until then. Unmatched formats stay NULL.
UPDATE "recipe_items" SET qty_value = regexp_replace(qty, ' g$',   '')::double precision, unit='gr'  WHERE qty ~ '^\d+(\.\d+)? g$';
UPDATE "recipe_items" SET qty_value = regexp_replace(qty, ' ml$',  '')::double precision, unit='ml'  WHERE qty ~ '^\d+(\.\d+)? ml$';
UPDATE "recipe_items" SET qty_value = regexp_replace(qty, ' uds?$','')::double precision, unit='ud'  WHERE qty ~ '^\d+ uds?$';
UPDATE "recipe_items" SET qty_value = 0.5, unit='ud'    WHERE qty = '1/2 ud';
UPDATE "recipe_items" SET qty_value = regexp_replace(qty, ' reb$', '')::double precision, unit='reb' WHERE qty ~ '^\d+ reb$';
UPDATE "recipe_items" SET qty_value = 1,   unit='libre' WHERE qty = 'libre';
