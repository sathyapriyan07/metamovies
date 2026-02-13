-- Videos and News module migration
-- Run in Supabase SQL editor

BEGIN;

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id TEXT,
  description TEXT,
  thumbnail_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  excerpt TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_videos_featured ON videos(is_featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news(is_featured, created_at DESC);

-- Enable RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- RLS Policies for videos
DROP POLICY IF EXISTS "Public read videos" ON videos;
CREATE POLICY "Public read videos" ON videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert videos" ON videos;
CREATE POLICY "Admin insert videos" ON videos FOR INSERT 
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin update videos" ON videos;
CREATE POLICY "Admin update videos" ON videos FOR UPDATE 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin delete videos" ON videos;
CREATE POLICY "Admin delete videos" ON videos FOR DELETE 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- RLS Policies for news
DROP POLICY IF EXISTS "Public read news" ON news;
CREATE POLICY "Public read news" ON news FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert news" ON news;
CREATE POLICY "Admin insert news" ON news FOR INSERT 
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin update news" ON news;
CREATE POLICY "Admin update news" ON news FOR UPDATE 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin delete news" ON news;
CREATE POLICY "Admin delete news" ON news FOR DELETE 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

COMMIT;
