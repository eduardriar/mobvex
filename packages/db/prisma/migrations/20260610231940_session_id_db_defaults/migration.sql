-- AlterTable
ALTER TABLE "set_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "workout_sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

