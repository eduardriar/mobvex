-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "equipment" TEXT;

-- Standardize muscle_group on the app's four Spanish buckets. Previously the
-- seeded catalog used free-text English muscle names.
UPDATE "exercises" SET "muscle_group" = 'Tren inferior' WHERE "muscle_group" IN ('Quadriceps', 'Hamstrings');
UPDATE "exercises" SET "muscle_group" = 'Empuje'        WHERE "muscle_group" IN ('Chest', 'Shoulders', 'Triceps');
UPDATE "exercises" SET "muscle_group" = 'Tirón'         WHERE "muscle_group" IN ('Back', 'Biceps');
UPDATE "exercises" SET "muscle_group" = 'Core y cardio' WHERE "muscle_group" = 'Core';
