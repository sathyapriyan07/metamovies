-- Studios / Platforms module

CREATE TABLE IF NOT EXISTS studios (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('studio', 'ott', 'production', 'distributor')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movie_studios (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  studio_id BIGINT REFERENCES studios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(movie_id, studio_id)
);

CREATE INDEX IF NOT EXISTS idx_movie_studios_movie_id ON movie_studios(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_studios_studio_id ON movie_studios(studio_id);
CREATE INDEX IF NOT EXISTS idx_studios_active ON studios(is_active);

ALTER TABLE studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_studios ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read studios" ON studios FOR SELECT USING (true);
CREATE POLICY "Public read movie_studios" ON movie_studios FOR SELECT USING (true);

-- Admin full control
CREATE POLICY "Admin manage studios" ON studios FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin manage movie_studios" ON movie_studios FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
