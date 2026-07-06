-- Additive registration migration: trainer invitations + goal enum realign.
--
-- NOTE: hand-written deliberately. A full `prisma migrate` diff also wanted to
-- DROP the nutrition tables (meals/recipes/recipe_items/meal_recipes) and rewrite
-- progress_photos, because this branch's schema.prisma is behind the live DB.
-- Those destructive statements are intentionally OMITTED here — this migration
-- only adds the invitations table/enum and realigns Goal.

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'accepted', 'revoked');

-- AlterEnum: realign Goal to the UI's 4 values. Safe — existing students only
-- use 'muscle_gain', which is preserved.
BEGIN;
CREATE TYPE "Goal_new" AS ENUM ('muscle_gain', 'fat_loss', 'performance', 'general_health');
ALTER TABLE "students" ALTER COLUMN "goal" TYPE "Goal_new" USING ("goal"::text::"Goal_new");
ALTER TYPE "Goal" RENAME TO "Goal_old";
ALTER TYPE "Goal_new" RENAME TO "Goal";
DROP TYPE "public"."Goal_old";
COMMIT;

-- CreateTable
CREATE TABLE "invitations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "trainer_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT,
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMPTZ(6),
    "accepted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_trainer_id_idx" ON "invitations"("trainer_id");

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
