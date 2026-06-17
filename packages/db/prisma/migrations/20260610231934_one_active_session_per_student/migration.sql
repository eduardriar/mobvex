-- Enforce at most one active workout session per student.
-- Partial unique index (cannot be expressed in the Prisma schema).
CREATE UNIQUE INDEX "one_active_session_per_student"
  ON "workout_sessions" ("student_id")
  WHERE "status" = 'active';
