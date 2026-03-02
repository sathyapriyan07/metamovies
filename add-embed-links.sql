-- Add embed_link columns for embedded player support
-- Run in Supabase SQL editor

BEGIN;

-- Add embed_link to movies table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movies' AND column_name = 'embed_link'
  ) THEN
    ALTER TABLE movies ADD COLUMN embed_link TEXT;
  END IF;
END $$;

-- Add embed_link to episodes table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'episodes' AND column_name = 'embed_link'
  ) THEN
    ALTER TABLE episodes ADD COLUMN embed_link TEXT;
  END IF;
END $$;

COMMIT;
