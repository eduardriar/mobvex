-- Add the remaining coaching goals to the Goal enum
ALTER TYPE "Goal" ADD VALUE IF NOT EXISTS 'hypertrophy';
ALTER TYPE "Goal" ADD VALUE IF NOT EXISTS 'force';
ALTER TYPE "Goal" ADD VALUE IF NOT EXISTS 'maintenance';
