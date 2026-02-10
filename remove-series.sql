-- Remove Series support from database schema (safe if already partially removed)
-- WARNING: Destructive. Backup first.

BEGIN;

-- Drop policies only if the table exists
DO $$
BEGIN
  IF to_regclass('public.series') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "Public read series" ON series';
    EXECUTE 'DROP POLICY IF EXISTS "Admin insert series" ON series';
    EXECUTE 'DROP POLICY IF EXISTS "Admin update series" ON series';
    EXECUTE 'DROP POLICY IF EXISTS "Admin delete series" ON series';
  END IF;
END$$;

-- Drop series-related tables
DROP TABLE IF EXISTS episodes CASCADE;
DROP TABLE IF EXISTS seasons CASCADE;
DROP TABLE IF EXISTS series CASCADE;

-- Remove series references from other tables
ALTER TABLE IF EXISTS "cast" DROP COLUMN IF EXISTS series_id;
ALTER TABLE IF EXISTS crew DROP COLUMN IF EXISTS series_id;
ALTER TABLE IF EXISTS external_links DROP COLUMN IF EXISTS series_id;
ALTER TABLE IF EXISTS watchlist DROP COLUMN IF EXISTS series_id;
ALTER TABLE IF EXISTS collection_items DROP COLUMN IF EXISTS series_id;

-- Remove hero banner series column + constraint if present
ALTER TABLE IF EXISTS hero_banners DROP CONSTRAINT IF EXISTS hero_banner_content_check;
ALTER TABLE IF EXISTS hero_banners DROP COLUMN IF EXISTS series_id;

-- Remove any series indexes
DROP INDEX IF EXISTS idx_series_trending;
DROP INDEX IF EXISTS idx_cast_series;
DROP INDEX IF EXISTS idx_crew_series;
DROP INDEX IF EXISTS idx_hero_banners_series;

COMMIT;
