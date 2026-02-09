-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Movies table
CREATE TABLE movies (
  id BIGSERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  overview TEXT,
  release_date DATE,
  runtime INTEGER,
  rating DECIMAL(3,1),
  poster_url TEXT,
  backdrop_url TEXT,
  genres TEXT[],
  trailer_url TEXT,
  trending BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Series table
CREATE TABLE series (
  id BIGSERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  overview TEXT,
  first_air_date DATE,
  rating DECIMAL(3,1),
  poster_url TEXT,
  backdrop_url TEXT,
  genres TEXT[],
  trailer_url TEXT,
  trending BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seasons table
CREATE TABLE seasons (
  id BIGSERIAL PRIMARY KEY,
  series_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  name TEXT,
  overview TEXT,
  poster_url TEXT,
  air_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Episodes table
CREATE TABLE episodes (
  id BIGSERIAL PRIMARY KEY,
  season_id BIGINT REFERENCES seasons(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  overview TEXT,
  still_url TEXT,
  air_date DATE,
  runtime INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Persons table (actors, directors, crew)
CREATE TABLE persons (
  id BIGSERIAL PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  biography TEXT,
  birthday DATE,
  place_of_birth TEXT,
  profile_url TEXT,
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cast table (actors in movies/series)
CREATE TABLE "cast" (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  series_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
  person_id BIGINT REFERENCES persons(id) ON DELETE CASCADE,
  character TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((movie_id IS NOT NULL AND series_id IS NULL) OR (movie_id IS NULL AND series_id IS NOT NULL))
);

-- Crew table (directors, writers, etc.)
CREATE TABLE crew (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  series_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
  person_id BIGINT REFERENCES persons(id) ON DELETE CASCADE,
  job TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((movie_id IS NOT NULL AND series_id IS NULL) OR (movie_id IS NULL AND series_id IS NOT NULL))
);

-- External links table (music platforms, social media)
CREATE TABLE external_links (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  series_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((movie_id IS NOT NULL AND series_id IS NULL) OR (movie_id IS NULL AND series_id IS NOT NULL))
);

-- Watchlist table
CREATE TABLE watchlist (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  series_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id),
  UNIQUE(user_id, series_id),
  CHECK ((movie_id IS NOT NULL AND series_id IS NULL) OR (movie_id IS NULL AND series_id IS NOT NULL))
);

-- Create indexes for better performance
CREATE INDEX idx_movies_trending ON movies(trending);
CREATE INDEX idx_movies_release_date ON movies(release_date);
CREATE INDEX idx_series_trending ON series(trending);
CREATE INDEX idx_cast_movie ON "cast"(movie_id);
CREATE INDEX idx_cast_series ON "cast"(series_id);
CREATE INDEX idx_cast_person ON "cast"(person_id);
CREATE INDEX idx_crew_movie ON crew(movie_id);
CREATE INDEX idx_crew_series ON crew(series_id);
CREATE INDEX idx_crew_person ON crew(person_id);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cast" ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Public read access for content
CREATE POLICY "Public read movies" ON movies FOR SELECT USING (true);
CREATE POLICY "Public read series" ON series FOR SELECT USING (true);
CREATE POLICY "Public read seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Public read episodes" ON episodes FOR SELECT USING (true);
CREATE POLICY "Public read persons" ON persons FOR SELECT USING (true);
CREATE POLICY "Public read cast" ON "cast" FOR SELECT USING (true);
CREATE POLICY "Public read crew" ON crew FOR SELECT USING (true);
CREATE POLICY "Public read external_links" ON external_links FOR SELECT USING (true);

-- Admin write access for content
CREATE POLICY "Admin insert movies" ON movies FOR INSERT 
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update movies" ON movies FOR UPDATE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete movies" ON movies FOR DELETE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin insert series" ON series FOR INSERT 
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update series" ON series FOR UPDATE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete series" ON series FOR DELETE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin manage seasons" ON seasons FOR ALL 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage episodes" ON episodes FOR ALL 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage persons" ON persons FOR ALL 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage cast" ON "cast" FOR ALL 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage crew" ON crew FOR ALL 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage external_links" ON external_links FOR ALL 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- User watchlist policies
CREATE POLICY "Users read own watchlist" ON watchlist FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Users insert own watchlist" ON watchlist FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own watchlist" ON watchlist FOR DELETE 
  USING (auth.uid() = user_id);

-- Users table policies
CREATE POLICY "Users read own data" ON users FOR SELECT 
  USING (auth.uid() = id);
CREATE POLICY "Users insert own data" ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Storage buckets (run in Supabase Storage settings)
-- Create buckets: 'posters', 'backdrops', 'profiles'
-- Set public access for all buckets

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, role, approved)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Collections table for custom home sections
CREATE TABLE collections (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection items (movies/series in collections)
CREATE TABLE collection_items (
  id BIGSERIAL PRIMARY KEY,
  collection_id BIGINT REFERENCES collections(id) ON DELETE CASCADE,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  series_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((movie_id IS NOT NULL AND series_id IS NULL) OR (movie_id IS NULL AND series_id IS NOT NULL))
);

CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read collection_items" ON collection_items FOR SELECT USING (true);
CREATE POLICY "Admin manage collections" ON collections FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage collection_items" ON collection_items FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Add music links support to movies and series
ALTER TABLE movies ADD COLUMN IF NOT EXISTS music_links JSONB;
ALTER TABLE series ADD COLUMN IF NOT EXISTS music_links JSONB;

-- Example structure: {"spotify": "url", "apple_music": "url", "youtube_music": "url"}

-- Add telegram and OTT links support
ALTER TABLE movies ADD COLUMN IF NOT EXISTS telegram_link TEXT;
ALTER TABLE movies ADD COLUMN IF NOT EXISTS watch_links JSONB;
ALTER TABLE series ADD COLUMN IF NOT EXISTS telegram_link TEXT;
ALTER TABLE series ADD COLUMN IF NOT EXISTS watch_links JSONB;

-- Example watch_links structure: {"netflix": "url", "prime": "url", "hotstar": "url", "zee5": "url"}

-- Add composer/music director links
ALTER TABLE movies ADD COLUMN IF NOT EXISTS composer_name TEXT;
ALTER TABLE movies ADD COLUMN IF NOT EXISTS composer_links JSONB;
ALTER TABLE series ADD COLUMN IF NOT EXISTS composer_name TEXT;
ALTER TABLE series ADD COLUMN IF NOT EXISTS composer_links JSONB;

-- Example composer_links structure: {"spotify": "url", "apple_music": "url", "youtube_music": "url"}

-- Add music platform links for composers/music directors
ALTER TABLE persons ADD COLUMN IF NOT EXISTS music_links JSONB;

-- Example music_links structure: {"spotify": "url", "apple_music": "url", "youtube_music": "url"}
