-- CreateTable
CREATE TABLE "nutrition" (
    "id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "trainer_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_calories" INTEGER,
    "protein_g" INTEGER,
    "carbs_g" INTEGER,
    "fat_g" INTEGER,
    "water_ml" INTEGER,
    "start_date" DATE,
    "end_date" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutrition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nutrition_student_id_idx" ON "nutrition"("student_id");

-- CreateIndex
CREATE INDEX "nutrition_trainer_id_idx" ON "nutrition"("trainer_id");

-- AddForeignKey
ALTER TABLE "nutrition" ADD CONSTRAINT "nutrition_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition" ADD CONSTRAINT "nutrition_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
