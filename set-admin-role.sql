-- Set Admin Role for User
-- Replace 'your-email@example.com' with your actual email

-- Method 1: Update user_metadata in auth.users (Recommended)
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';

-- Method 2: If you have a users table
UPDATE users
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Verify the change
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'your-email@example.com';
