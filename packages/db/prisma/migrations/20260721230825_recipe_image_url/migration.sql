-- Recipe image upload: trainers can attach a picture to a recipe, uploaded
-- to the recipe-media Storage bucket (see storage/recipe-media.sql).
ALTER TABLE "recipes" ADD COLUMN "image_url" TEXT;
