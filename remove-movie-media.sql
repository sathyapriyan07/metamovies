-- Remove legacy movie media/gallery module objects

-- Remove policies if table still exists
DROP POLICY IF EXISTS "Public read movie_media" ON movie_media;
DROP POLICY IF EXISTS "Admin insert movie_media" ON movie_media;
DROP POLICY IF EXISTS "Admin update movie_media" ON movie_media;
DROP POLICY IF EXISTS "Admin delete movie_media" ON movie_media;

-- Remove indexes if they still exist
DROP INDEX IF EXISTS idx_movie_media_movie_id;
DROP INDEX IF EXISTS idx_movie_media_type;

-- Remove table
DROP TABLE IF EXISTS movie_media;

-- Optional manual cleanup in Supabase Storage:
-- Delete any media-only bucket that was used exclusively by movie gallery uploads.
