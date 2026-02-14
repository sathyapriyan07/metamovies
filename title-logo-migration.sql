-- Add title logo fields to movies table
ALTER TABLE movies ADD COLUMN IF NOT EXISTS title_logo_url TEXT;
ALTER TABLE movies ADD COLUMN IF NOT EXISTS use_text_title BOOLEAN DEFAULT false;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_movies_title_logo ON movies(title_logo_url);