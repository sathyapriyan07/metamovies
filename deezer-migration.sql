-- Deezer import support
-- Run in Supabase SQL editor

BEGIN;

-- Artists
ALTER TABLE artists ADD COLUMN IF NOT EXISTS deezer_artist_id BIGINT UNIQUE;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Albums
ALTER TABLE albums ADD COLUMN IF NOT EXISTS deezer_album_id BIGINT UNIQUE;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Tracks
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS deezer_track_id BIGINT UNIQUE;

-- Track artists (many-to-many for Deezer artists)
CREATE TABLE IF NOT EXISTS track_artists (
  id BIGSERIAL PRIMARY KEY,
  track_id BIGINT REFERENCES tracks(id) ON DELETE CASCADE,
  artist_id BIGINT REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'artist',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(track_id, artist_id, role)
);

CREATE INDEX IF NOT EXISTS idx_track_artists_track ON track_artists(track_id);
CREATE INDEX IF NOT EXISTS idx_track_artists_artist ON track_artists(artist_id);

ALTER TABLE track_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read track_artists" ON track_artists FOR SELECT USING (true);
CREATE POLICY "Admin manage track_artists" ON track_artists FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

COMMIT;
