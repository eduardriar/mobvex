-- Re-attach progress photos to the day's Progress record (previously keyed by
-- student_id + date). Backfills existing rows so no photos are lost.

-- 1. New FK column, nullable for the backfill.
ALTER TABLE "progress_photos" ADD COLUMN "progress_id" UUID;

-- 2. Ensure a Progress row exists for every (student, date) that has photos
--    (a photo may have been uploaded on a day with no measurement entry).
INSERT INTO "progress" ("student_id", "date")
SELECT DISTINCT pp."student_id", pp."date"
FROM "progress_photos" pp
WHERE NOT EXISTS (
  SELECT 1 FROM "progress" p
  WHERE p."student_id" = pp."student_id" AND p."date" = pp."date"
)
ON CONFLICT ("student_id", "date") DO NOTHING;

-- 3. Backfill progress_id from the matching Progress row.
UPDATE "progress_photos" pp
SET "progress_id" = p."id"
FROM "progress" p
WHERE p."student_id" = pp."student_id" AND p."date" = pp."date";

-- 4. Enforce NOT NULL now that every row is linked.
ALTER TABLE "progress_photos" ALTER COLUMN "progress_id" SET NOT NULL;

-- 5. Drop the old student-based schema.
ALTER TABLE "progress_photos" DROP CONSTRAINT "progress_photos_student_id_fkey";
DROP INDEX "progress_photos_student_id_date_pose_key";
DROP INDEX "progress_photos_student_id_idx";
ALTER TABLE "progress_photos" DROP COLUMN "date";
ALTER TABLE "progress_photos" DROP COLUMN "student_id";

-- 6. New indexes + FK to progress.
CREATE INDEX "progress_photos_progress_id_idx" ON "progress_photos"("progress_id");
CREATE UNIQUE INDEX "progress_photos_progress_id_pose_key" ON "progress_photos"("progress_id", "pose");
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_progress_id_fkey" FOREIGN KEY ("progress_id") REFERENCES "progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
