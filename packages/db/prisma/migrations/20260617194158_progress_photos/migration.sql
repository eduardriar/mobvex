-- CreateEnum
CREATE TYPE "PhotoPose" AS ENUM ('front', 'left', 'right', 'back');

-- CreateTable
CREATE TABLE "progress_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "pose" "PhotoPose" NOT NULL,
    "storage_path" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "progress_photos_student_id_idx" ON "progress_photos"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "progress_photos_student_id_date_pose_key" ON "progress_photos"("student_id", "date", "pose");

-- AddForeignKey
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

