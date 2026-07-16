-- Let the database generate invitation tokens. supabase-js inserts don't run
-- client-side defaults, so the default must live in the DB for the trainer
-- app to create invitations without supplying a token.
ALTER TABLE "invitations" ALTER COLUMN "token" SET DEFAULT gen_random_uuid()::text;
