-- Add vote_average column to episodes table for TMDB ratings
-- Run in Supabase SQL editor

BEGIN;

-- Add vote_average to episodes table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'episodes' AND column_name = 'vote_average'
  ) THEN
    ALTER TABLE episodes ADD COLUMN vote_average NUMERIC(3,1);
  END IF;
END $$;

COMMIT;
