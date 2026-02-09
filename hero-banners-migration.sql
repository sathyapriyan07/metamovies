-- Hero Banners Table
-- Run this SQL in your Supabase SQL Editor to create the hero_banners table

CREATE TABLE IF NOT EXISTS hero_banners (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  series_id BIGINT REFERENCES series(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT hero_banner_content_check CHECK (
    (movie_id IS NOT NULL AND series_id IS NULL) OR 
    (movie_id IS NULL AND series_id IS NOT NULL)
  )
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hero_banners_active ON hero_banners(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_hero_banners_movie ON hero_banners(movie_id);
CREATE INDEX IF NOT EXISTS idx_hero_banners_series ON hero_banners(series_id);

-- Enable Row Level Security
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active banners
CREATE POLICY "Anyone can view active hero banners"
  ON hero_banners FOR SELECT
  USING (is_active = true);

-- Policy: Admins can do everything
CREATE POLICY "Admins can manage hero banners"
  ON hero_banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_hero_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_banners_updated_at
  BEFORE UPDATE ON hero_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_hero_banners_updated_at();
