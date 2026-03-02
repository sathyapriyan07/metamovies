-- Delete all series, seasons, and episodes
-- Run in Supabase SQL editor
-- WARNING: This will delete ALL series data

BEGIN;

-- Delete episodes first (child table)
DELETE FROM episodes;

-- Delete seasons (child table)
DELETE FROM seasons;

-- Delete series cast and crew
DELETE FROM series_cast;
DELETE FROM series_crew;

-- Delete series (parent table)
DELETE FROM series;

COMMIT;

-- Verify deletion
SELECT 
  (SELECT COUNT(*) FROM series) as series_count,
  (SELECT COUNT(*) FROM seasons) as seasons_count,
  (SELECT COUNT(*) FROM episodes) as episodes_count;
