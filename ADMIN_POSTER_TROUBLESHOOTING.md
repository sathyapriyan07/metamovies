# Admin Poster Editing Troubleshooting Guide

## Issue: "Edit Poster" and "Edit Backdrop" buttons not showing

### Solution: Set Admin Role

The buttons only appear when `isAdmin` is `true`. This requires setting the admin role in your database.

---

## Step 1: Set Your User as Admin

Run this SQL in your **Supabase SQL Editor**:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

---

## Step 2: Verify Admin Role

Check if the role was set:

```sql
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email = 'your-email@example.com';
```

You should see `role: admin` in the results.

---

## Step 3: Log Out and Log Back In

1. Sign out of your MetaMovies account
2. Sign back in
3. The auth token will now include the admin role

---

## Step 4: Check Browser Console

Open browser DevTools (F12) and check the console on a movie detail page.

You should see:
```
isAdmin: true
user: { ... user_metadata: { role: 'admin' } }
```

---

## Step 5: Test the Buttons

1. Go to any movie detail page (e.g., `/movie/1`)
2. You should now see:
   - "✓ In Watchlist" or "+ Add to Watchlist"
   - **"Edit Poster"** ← New button
   - **"Edit Backdrop"** ← New button

---

## Features

### Edit Poster
- Click "Edit Poster"
- Modal opens with current poster preview
- Enter new poster URL
- See live preview
- Click "Save" to update

### Edit Backdrop
- Click "Edit Backdrop"
- Modal opens with current backdrop preview
- Enter new backdrop URL
- See live preview
- Click "Save" to update

---

## Alternative: Check Users Table

If you have a separate `users` table, also update it:

```sql
UPDATE users
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');
```

---

## Still Not Working?

1. **Clear browser cache** and reload
2. **Check AuthContext.jsx** - Verify the isAdmin logic:
   ```javascript
   isAdmin: user?.user_metadata?.role === 'admin' || user?.raw_user_meta_data?.role === 'admin'
   ```
3. **Check console logs** - Look for the debug output
4. **Verify RLS policies** - Ensure admin can update movies tables

---

## Quick Test

Run this in browser console on any movie page:
```javascript
console.log('User:', window.localStorage.getItem('supabase.auth.token'));
```

The token should contain `"role":"admin"` in the user_metadata.
