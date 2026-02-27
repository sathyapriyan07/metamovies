-- Series (TV) module tables
-- Run in Supabase SQL editor

BEGIN;

CREATE TABLE IF NOT EXISTS series (
  id BIGSERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  overview TEXT,
  first_air_date DATE,
  last_air_date DATE,
  status TEXT,
  number_of_seasons INTEGER,
  number_of_episodes INTEGER,
  rating DECIMAL(3,1),
  tmdb_rating DECIMAL(3,1),
  imdb_rating DECIMAL(3,1),
  poster_url TEXT,
  backdrop_url TEXT,
  watch_links JSONB,
  title_logo_url TEXT,
  use_text_title BOOLEAN DEFAULT true,
  genres TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seasons (
  id BIGSERIAL PRIMARY KEY,
  series_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  name TEXT,
  overview TEXT,
  air_date DATE,
  episode_count INTEGER,
  poster_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(series_id, season_number)
);

CREATE TABLE IF NOT EXISTS episodes (
  id BIGSERIAL PRIMARY KEY,
  series_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
  season_id BIGINT REFERENCES seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  name TEXT,
  overview TEXT,
  air_date DATE,
  runtime INTEGER,
  still_url TEXT,
  watch_link TEXT,
  tmdb_rating DECIMAL(3,1),
  imdb_rating DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(season_id, episode_number)
);

CREATE TABLE IF NOT EXISTS series_cast (
  id BIGSERIAL PRIMARY KEY,
  series_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
  person_id BIGINT REFERENCES persons(id) ON DELETE CASCADE,
  character TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(series_id, person_id, character)
);

CREATE TABLE IF NOT EXISTS series_crew (
  id BIGSERIAL PRIMARY KEY,
  series_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
  person_id BIGINT REFERENCES persons(id) ON DELETE CASCADE,
  job TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(series_id, person_id, job)
);

CREATE INDEX IF NOT EXISTS idx_series_tmdb ON series(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_seasons_series ON seasons(series_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season ON episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_series_cast_series ON series_cast(series_id);
CREATE INDEX IF NOT EXISTS idx_series_cast_person ON series_cast(person_id);
CREATE INDEX IF NOT EXISTS idx_series_crew_series ON series_crew(series_id);
CREATE INDEX IF NOT EXISTS idx_series_crew_person ON series_crew(person_id);

ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_cast ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_crew ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series' AND policyname = 'Public read series') THEN
    DROP POLICY "Public read series" ON series;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'seasons' AND policyname = 'Public read seasons') THEN
    DROP POLICY "Public read seasons" ON seasons;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'episodes' AND policyname = 'Public read episodes') THEN
    DROP POLICY "Public read episodes" ON episodes;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series_cast' AND policyname = 'Public read series_cast') THEN
    DROP POLICY "Public read series_cast" ON series_cast;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series_crew' AND policyname = 'Public read series_crew') THEN
    DROP POLICY "Public read series_crew" ON series_crew;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series' AND policyname = 'Admin manage series') THEN
    DROP POLICY "Admin manage series" ON series;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'seasons' AND policyname = 'Admin manage seasons') THEN
    DROP POLICY "Admin manage seasons" ON seasons;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'episodes' AND policyname = 'Admin manage episodes') THEN
    DROP POLICY "Admin manage episodes" ON episodes;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series_cast' AND policyname = 'Admin manage series_cast') THEN
    DROP POLICY "Admin manage series_cast" ON series_cast;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'series_crew' AND policyname = 'Admin manage series_crew') THEN
    DROP POLICY "Admin manage series_crew" ON series_crew;
  END IF;
END $$;

CREATE POLICY "Public read series" ON series FOR SELECT USING (true);
CREATE POLICY "Public read seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read episodes" ON episodes FOR SELECT USING (true);
CREATE POLICY "Public read series_cast" ON series_cast FOR SELECT USING (true);
CREATE POLICY "Public read series_crew" ON series_crew FOR SELECT USING (true);

CREATE POLICY "Admin manage series" ON series FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage seasons" ON seasons FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage episodes" ON episodes FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage series_cast" ON series_cast FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage series_crew" ON series_crew FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

COMMIT;
