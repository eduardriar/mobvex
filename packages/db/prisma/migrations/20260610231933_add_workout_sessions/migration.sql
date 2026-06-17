-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('active', 'completed', 'abandoned');

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "routine_id" UUID NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'active',
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "notes" TEXT,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "set_logs" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "routine_exercise_id" UUID NOT NULL,
    "set_number" INTEGER NOT NULL,
    "weight_kg" DOUBLE PRECISION,
    "reps" INTEGER,
    "rir" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "set_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workout_sessions_student_id_idx" ON "workout_sessions"("student_id");

-- CreateIndex
CREATE INDEX "workout_sessions_routine_id_idx" ON "workout_sessions"("routine_id");

-- CreateIndex
CREATE INDEX "set_logs_session_id_idx" ON "set_logs"("session_id");

-- CreateIndex
CREATE INDEX "set_logs_routine_exercise_id_idx" ON "set_logs"("routine_exercise_id");

-- CreateIndex
CREATE UNIQUE INDEX "set_logs_session_id_routine_exercise_id_set_number_key" ON "set_logs"("session_id", "routine_exercise_id", "set_number");

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "set_logs" ADD CONSTRAINT "set_logs_routine_exercise_id_fkey" FOREIGN KEY ("routine_exercise_id") REFERENCES "routine_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
