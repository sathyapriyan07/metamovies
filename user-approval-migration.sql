-- Add approved column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Update existing users to approved
UPDATE users SET approved = true WHERE approved IS NULL;

-- Update RLS policies to check approval status
DROP POLICY IF EXISTS "Users read own data" ON users;
CREATE POLICY "Users read own data" ON users FOR SELECT 
  USING (auth.uid() = id AND approved = true);

-- Allow admins to see all users
DROP POLICY IF EXISTS "Admins read all users" ON users;
CREATE POLICY "Admins read all users" ON users FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Allow admins to update users
DROP POLICY IF EXISTS "Admins update users" ON users;
CREATE POLICY "Admins update users" ON users FOR UPDATE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
