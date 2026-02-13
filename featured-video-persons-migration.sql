-- Featured Video Persons Junction Table Migration
-- Run in Supabase SQL editor

BEGIN;

-- Create junction table
CREATE TABLE IF NOT EXISTS featured_video_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  featured_video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  person_id BIGINT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(featured_video_id, person_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_featured_video_persons_video ON featured_video_persons(featured_video_id);
CREATE INDEX IF NOT EXISTS idx_featured_video_persons_person ON featured_video_persons(person_id);

-- Enable RLS
ALTER TABLE featured_video_persons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Public read featured_video_persons" ON featured_video_persons;
CREATE POLICY "Public read featured_video_persons" ON featured_video_persons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert featured_video_persons" ON featured_video_persons;
CREATE POLICY "Admin insert featured_video_persons" ON featured_video_persons FOR INSERT 
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin update featured_video_persons" ON featured_video_persons;
CREATE POLICY "Admin update featured_video_persons" ON featured_video_persons FOR UPDATE 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

DROP POLICY IF EXISTS "Admin delete featured_video_persons" ON featured_video_persons;
CREATE POLICY "Admin delete featured_video_persons" ON featured_video_persons FOR DELETE 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

COMMIT;
