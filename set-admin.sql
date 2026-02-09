-- Set user as admin by email
-- Replace 'sathyapriyan710@gmail.com' with your actual email

-- Method 1: Update auth.users metadata (RECOMMENDED)
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'sathyapriyan710@gmail.com';

-- Method 2: Update users table
UPDATE users 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'sathyapriyan710@gmail.com');

-- Verify the update
SELECT id, email, raw_user_meta_data->>'role' as role 
FROM auth.users 
WHERE email = 'sathyapriyan710@gmail.com';
