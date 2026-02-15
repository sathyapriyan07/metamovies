-- Platforms module

CREATE TABLE IF NOT EXISTS platforms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('platform', 'ott', 'production', 'distributor')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS movie_platforms (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  platform_id BIGINT REFERENCES platforms(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(movie_id, platform_id)
);

CREATE INDEX IF NOT EXISTS idx_movie_platforms_movie_id ON movie_platforms(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_platforms_platform_id ON movie_platforms(platform_id);
CREATE INDEX IF NOT EXISTS idx_platforms_active ON platforms(is_active);

ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE movie_platforms ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read platforms" ON platforms FOR SELECT USING (true);
CREATE POLICY "Public read movie_platforms" ON movie_platforms FOR SELECT USING (true);

-- Admin full control
CREATE POLICY "Admin manage platforms" ON platforms FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admin manage movie_platforms" ON movie_platforms FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
