-- Verify episodes table structure and add season_number if missing
-- Run in Supabase SQL editor

BEGIN;

-- Add season_number column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'episodes' AND column_name = 'season_number'
  ) THEN
    ALTER TABLE episodes ADD COLUMN season_number INT;
  END IF;
END $$;

-- Update season_number from seasons table if NULL
UPDATE episodes e
SET season_number = s.season_number
FROM seasons s
WHERE e.season_id = s.id
  AND e.season_number IS NULL;

COMMIT;

-- Verify data
SELECT 
  e.id,
  e.series_id,
  e.season_id,
  e.season_number,
  e.episode_number,
  e.name
FROM episodes e
ORDER BY e.series_id, e.season_number, e.episode_number
LIMIT 20;
