-- Invite token students share with the mobile app to claim their account
ALTER TABLE "students" ADD COLUMN "invite_token" UUID NOT NULL DEFAULT gen_random_uuid();
CREATE UNIQUE INDEX "students_invite_token_key" ON "students"("invite_token");
