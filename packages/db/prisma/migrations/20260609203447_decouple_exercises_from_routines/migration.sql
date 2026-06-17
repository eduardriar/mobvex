-- DropForeignKey
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_routine_id_fkey";

-- DropIndex
DROP INDEX "exercises_routine_id_idx";

-- AlterTable
ALTER TABLE "exercises" DROP COLUMN "notes",
DROP COLUMN "reps",
DROP COLUMN "rest_seconds",
DROP COLUMN "routine_id",
DROP COLUMN "sets",
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "muscle_group" TEXT,
ADD COLUMN     "trainer_id" UUID;

-- CreateTable
CREATE TABLE "routine_exercises" (
    "id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "rest_seconds" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "routine_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "routine_exercises_routine_id_idx" ON "routine_exercises"("routine_id");

-- CreateIndex
CREATE INDEX "routine_exercises_exercise_id_idx" ON "routine_exercises"("exercise_id");

-- CreateIndex
CREATE UNIQUE INDEX "routine_exercises_routine_id_order_key" ON "routine_exercises"("routine_id", "order");

-- CreateIndex
CREATE INDEX "exercises_trainer_id_idx" ON "exercises"("trainer_id");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_exercises" ADD CONSTRAINT "routine_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

