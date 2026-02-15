-- Add external player controls to movies
ALTER TABLE movies
  ALTER COLUMN tmdb_id TYPE TEXT USING tmdb_id::text;

ALTER TABLE movies
  ADD COLUMN IF NOT EXISTS player_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS player_url_override TEXT;
