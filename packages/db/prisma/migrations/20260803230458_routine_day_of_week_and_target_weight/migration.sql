-- Routine builder: one Routine row per active day of the week, and a
-- prescribed target weight per RoutineExercise (previously UI-only, discarded
-- on save).
CREATE TYPE "DayOfWeek" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

ALTER TABLE "routines" ADD COLUMN "day_of_week" "DayOfWeek";

ALTER TABLE "routine_exercises" ADD COLUMN "target_weight" DOUBLE PRECISION;
