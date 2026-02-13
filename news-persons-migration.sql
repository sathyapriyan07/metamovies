-- News Persons Junction Table Migration
-- Run in Supabase SQL editor

BEGIN;

-- Create junction table
CREATE TABLE IF NOT EXISTS news_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
  person_id BIGINT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(news_id, person_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_news_persons_news ON news_persons(news_id);
CREATE INDEX IF NOT EXISTS idx_news_persons_person ON news_persons(person_id);

-- Enable RLS
ALTER TABLE news_persons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public read news_persons" ON news_persons;
CREATE POLICY "Public read news_persons" ON news_persons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert news_persons" ON news_persons;
CREATE POLICY "Admin insert news_persons" ON news_persons FOR INSERT 
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin update news_persons" ON news_persons;
CREATE POLICY "Admin update news_persons" ON news_persons FOR UPDATE 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin delete news_persons" ON news_persons;
CREATE POLICY "Admin delete news_persons" ON news_persons FOR DELETE 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

COMMIT;
