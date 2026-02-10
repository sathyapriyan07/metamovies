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
  imdb_rating DECIMAL(3,1),
  rotten_rating INTEGER,
  imdb_votes INTEGER,
  rating_last_updated TIMESTAMP,
  poster_url TEXT,
  backdrop_url TEXT,
  genres TEXT[],
  trailer_url TEXT,
  trending BOOLEAN DEFAULT false,
  is_now_showing BOOLEAN DEFAULT false,
  booking_url TEXT,
  booking_label TEXT DEFAULT 'Book Tickets',
  booking_last_updated TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Music table
CREATE TABLE music (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  album TEXT,
  duration_seconds INTEGER,
  release_year INTEGER,
  poster_url TEXT,
  spotify_url TEXT,
  apple_music_url TEXT,
  youtube_music_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artists table
CREATE TABLE artists (
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

-- Albums table
CREATE TABLE albums (
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

-- Tracks table
CREATE TABLE tracks (
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

-- Cast table (actors in movies)
CREATE TABLE "cast" (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  person_id BIGINT REFERENCES persons(id) ON DELETE CASCADE,
  character TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crew table (directors, writers, etc.)
CREATE TABLE crew (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  person_id BIGINT REFERENCES persons(id) ON DELETE CASCADE,
  job TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External links table (music platforms, social media)
CREATE TABLE external_links (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist table
CREATE TABLE watchlist (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  music_id BIGINT REFERENCES tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id),
  UNIQUE(user_id, music_id),
  CHECK ((movie_id IS NOT NULL AND music_id IS NULL) OR (movie_id IS NULL AND music_id IS NOT NULL))
);

-- Create indexes for better performance
CREATE INDEX idx_movies_trending ON movies(trending);
CREATE INDEX idx_movies_release_date ON movies(release_date);
CREATE INDEX idx_music_release_year ON music(release_year);
CREATE INDEX idx_artists_name ON artists(name);
CREATE INDEX idx_albums_artist ON albums(artist_id);
CREATE INDEX idx_tracks_album ON tracks(album_id);
CREATE INDEX idx_cast_movie ON "cast"(movie_id);
CREATE INDEX idx_cast_person ON "cast"(person_id);
CREATE INDEX idx_crew_movie ON crew(movie_id);
CREATE INDEX idx_crew_person ON crew(person_id);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE music ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cast" ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Public read access for content
CREATE POLICY "Public read movies" ON movies FOR SELECT USING (true);
CREATE POLICY "Public read music" ON music FOR SELECT USING (true);
CREATE POLICY "Public read artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Public read albums" ON albums FOR SELECT USING (true);
CREATE POLICY "Public read tracks" ON tracks FOR SELECT USING (true);
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

CREATE POLICY "Admin insert music" ON music FOR INSERT 
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update music" ON music FOR UPDATE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete music" ON music FOR DELETE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin insert artists" ON artists FOR INSERT 
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update artists" ON artists FOR UPDATE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete artists" ON artists FOR DELETE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin insert albums" ON albums FOR INSERT 
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update albums" ON albums FOR UPDATE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete albums" ON albums FOR DELETE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin insert tracks" ON tracks FOR INSERT 
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin update tracks" ON tracks FOR UPDATE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin delete tracks" ON tracks FOR DELETE 
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

-- Collection items (movies in collections)
CREATE TABLE collection_items (
  id BIGSERIAL PRIMARY KEY,
  collection_id BIGINT REFERENCES collections(id) ON DELETE CASCADE,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Public read collection_items" ON collection_items FOR SELECT USING (true);
CREATE POLICY "Admin manage collections" ON collections FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage collection_items" ON collection_items FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Add music links support to movies
ALTER TABLE movies ADD COLUMN IF NOT EXISTS music_links JSONB;

-- Example structure: {"spotify": "url", "apple_music": "url", "youtube_music": "url"}

-- Add telegram and OTT links support
ALTER TABLE movies ADD COLUMN IF NOT EXISTS telegram_link TEXT;
ALTER TABLE movies ADD COLUMN IF NOT EXISTS watch_links JSONB;

-- Example watch_links structure: {"netflix": "url", "prime": "url", "hotstar": "url", "zee5": "url"}

-- Add composer/music director links
ALTER TABLE movies ADD COLUMN IF NOT EXISTS composer_name TEXT;
ALTER TABLE movies ADD COLUMN IF NOT EXISTS composer_links JSONB;

-- Example composer_links structure: {"spotify": "url", "apple_music": "url", "youtube_music": "url"}

-- Add music platform links for composers/music directors
ALTER TABLE persons ADD COLUMN IF NOT EXISTS music_links JSONB;

-- Example music_links structure: {"spotify": "url", "apple_music": "url", "youtube_music": "url"}
