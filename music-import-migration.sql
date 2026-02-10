-- Music import schema: artists, albums, tracks + watchlist FK update
-- Run in Supabase SQL editor

BEGIN;

CREATE TABLE IF NOT EXISTS artists (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  profile_image_url TEXT,
  banner_image_url TEXT,
  bio TEXT,
  tags TEXT[],
  social_links JSONB,
  import_source TEXT,
  is_imported BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS albums (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  artist_id BIGINT REFERENCES artists(id) ON DELETE CASCADE,
  cover_image_url TEXT,
  release_year INTEGER,
  total_duration_seconds INTEGER,
  spotify_url TEXT,
  apple_music_url TEXT,
  youtube_music_url TEXT,
  amazon_music_url TEXT,
  import_source TEXT,
  is_imported BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tracks (
  id BIGSERIAL PRIMARY KEY,
  album_id BIGINT REFERENCES albums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_seconds INTEGER,
  preview_url TEXT,
  artwork_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  youtube_music_url TEXT,
  amazon_music_url TEXT,
  import_source TEXT,
  is_imported BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist on already-created tables
ALTER TABLE artists ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS banner_image_url TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE artists ADD COLUMN IF NOT EXISTS social_links JSONB;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS import_source TEXT;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS is_imported BOOLEAN DEFAULT false;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE albums ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS release_year INTEGER;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS total_duration_seconds INTEGER;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS spotify_url TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS apple_music_url TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS youtube_music_url TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS amazon_music_url TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS import_source TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS is_imported BOOLEAN DEFAULT false;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE tracks ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS preview_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS artwork_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS spotify_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS apple_music_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS youtube_music_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS amazon_music_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS import_source TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS is_imported BOOLEAN DEFAULT false;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_artists_name ON artists(name);
CREATE INDEX IF NOT EXISTS idx_albums_artist ON albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album_id);

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='artists' AND policyname='Public read artists') THEN
    EXECUTE 'CREATE POLICY "Public read artists" ON artists FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='albums' AND policyname='Public read albums') THEN
    EXECUTE 'CREATE POLICY "Public read albums" ON albums FOR SELECT USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tracks' AND policyname='Public read tracks') THEN
    EXECUTE 'CREATE POLICY "Public read tracks" ON tracks FOR SELECT USING (true)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='artists' AND policyname='Admin insert artists') THEN
    EXECUTE 'CREATE POLICY "Admin insert artists" ON artists FOR INSERT WITH CHECK ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='artists' AND policyname='Admin update artists') THEN
    EXECUTE 'CREATE POLICY "Admin update artists" ON artists FOR UPDATE USING ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='artists' AND policyname='Admin delete artists') THEN
    EXECUTE 'CREATE POLICY "Admin delete artists" ON artists FOR DELETE USING ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='albums' AND policyname='Admin insert albums') THEN
    EXECUTE 'CREATE POLICY "Admin insert albums" ON albums FOR INSERT WITH CHECK ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='albums' AND policyname='Admin update albums') THEN
    EXECUTE 'CREATE POLICY "Admin update albums" ON albums FOR UPDATE USING ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='albums' AND policyname='Admin delete albums') THEN
    EXECUTE 'CREATE POLICY "Admin delete albums" ON albums FOR DELETE USING ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tracks' AND policyname='Admin insert tracks') THEN
    EXECUTE 'CREATE POLICY "Admin insert tracks" ON tracks FOR INSERT WITH CHECK ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tracks' AND policyname='Admin update tracks') THEN
    EXECUTE 'CREATE POLICY "Admin update tracks" ON tracks FOR UPDATE USING ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tracks' AND policyname='Admin delete tracks') THEN
    EXECUTE 'CREATE POLICY "Admin delete tracks" ON tracks FOR DELETE USING ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';
  END IF;
END$$;

-- Update watchlist music_id to reference tracks
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'watchlist'::regclass
    AND contype = 'f'
    AND array_position(conkey, (
      SELECT attnum FROM pg_attribute
      WHERE attrelid = 'watchlist'::regclass AND attname = 'music_id'
    )) IS NOT NULL
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE watchlist DROP CONSTRAINT %I', constraint_name);
  END IF;
END$$;

ALTER TABLE watchlist
  ADD CONSTRAINT watchlist_music_fk
  FOREIGN KEY (music_id) REFERENCES tracks(id) ON DELETE CASCADE;

COMMIT;
