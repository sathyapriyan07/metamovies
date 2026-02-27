-- Movie media videos support
-- Run in Supabase SQL editor

BEGIN;

ALTER TABLE movies ADD COLUMN IF NOT EXISTS media_videos JSONB;

COMMIT;
