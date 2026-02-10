-- Create avatar_options table
CREATE TABLE IF NOT EXISTS avatar_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE avatar_options ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read avatar options
CREATE POLICY "Anyone can view avatar options"
  ON avatar_options
  FOR SELECT
  TO public
  USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Only admins can manage avatar options"
  ON avatar_options
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Insert some default avatars (optional)
INSERT INTO avatar_options (name, url) VALUES
  ('Avatar 1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'),
  ('Avatar 2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka'),
  ('Avatar 3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna'),
  ('Avatar 4', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max'),
  ('Avatar 5', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella'),
  ('Avatar 6', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'),
  ('Avatar 7', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy'),
  ('Avatar 8', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper');
