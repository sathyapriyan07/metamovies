-- Add ratings metadata to movies
ALTER TABLE movies
  ADD COLUMN IF NOT EXISTS imdb_rating numeric,
  ADD COLUMN IF NOT EXISTS rotten_rating integer,
  ADD COLUMN IF NOT EXISTS imdb_votes integer,
  ADD COLUMN IF NOT EXISTS rating_last_updated timestamp;
