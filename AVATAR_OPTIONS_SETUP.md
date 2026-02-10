# Avatar Options Setup Guide

## Database Setup

Run the SQL migration in your Supabase SQL Editor:

```sql
-- File: avatar-options-migration.sql
```

This will:
- Create `avatar_options` table
- Set up Row Level Security (RLS)
- Insert 8 default avatar options using DiceBear API

## Features Added

### 1. Admin Page: Manage Avatars (`/admin/manage-avatars`)
- Add new avatar options with name and URL
- Preview avatars before adding
- Delete existing avatar options
- Grid view of all available avatars

### 2. Updated Signup Page
- Users can select from predefined avatars
- Grid of 8 avatar options (clickable)
- Option to use custom URL
- Selected avatar highlighted with red border
- Avatar preview in real-time

### 3. Database Table: `avatar_options`
```
- id (UUID, Primary Key)
- name (TEXT) - Display name for avatar
- url (TEXT) - Image URL
- created_at (TIMESTAMP)
```

## Usage

### For Admins:
1. Go to `/admin/manage-avatars`
2. Add avatar options:
   - Enter name (e.g., "Cool Avatar")
   - Enter image URL
   - Click "Add"
3. Preview shows before saving
4. Delete unwanted options

### For Users:
1. Go to Signup page
2. Fill username, email, password
3. Choose avatar:
   - Click on any predefined avatar
   - OR click "Use custom URL" to enter own URL
4. Selected avatar shows red border
5. Sign up with chosen avatar

## Avatar Sources

You can use:
- **DiceBear API**: `https://api.dicebear.com/7.x/avataaars/svg?seed=YourName`
- **Gravatar**: `https://www.gravatar.com/avatar/hash`
- **Custom uploads**: Upload to Supabase Storage and use public URL
- **Any public image URL**

## Default Avatars

The migration includes 8 default avatars using DiceBear's avataaars style with different seeds:
- Felix, Aneka, Luna, Max, Bella, Charlie, Lucy, Cooper

## Admin Dashboard Link

A new card "🎭 Manage Avatars" has been added to the Admin Dashboard for easy access.
