# Hero Banner Feature - Setup Guide

## 🎬 Overview
Admin-controlled hero banner system for MetaMovies homepage with database-driven content management.

## 📋 Setup Instructions

### 1. Database Setup
Run the SQL migration in your Supabase SQL Editor:
```bash
# File: hero-banners-migration.sql
```

This creates:
- `hero_banners` table with movie/series references
- Indexes for performance
- Row Level Security policies
- Auto-update timestamp trigger

### 2. Features Added

#### Frontend Components
- **HeroBanner.jsx** - Displays featured content on homepage
- **ManageHeroBanner.jsx** - Admin panel for banner management

#### Admin Controls
- ✅ Add movies/series to hero banner
- ✅ Set display order (1, 2, 3...)
- ✅ Toggle active/inactive status
- ✅ Delete banners
- ✅ Search and preview content

#### Database Functions
- `getHeroBanners()` - Fetch active banners ordered by display_order

### 3. Access Admin Panel
1. Login as admin user
2. Navigate to `/admin`
3. Click "🎬 Manage Hero Banner"
4. Search and add movies/series
5. Reorder and toggle active status

### 4. How It Works

**Homepage Display:**
- Shows only active banners
- Ordered by `display_order` (ascending)
- First banner is featured
- Up to 10 thumbnails in carousel
- Auto-filters items with backdrop images

**Admin Management:**
- Search movies/series by title
- Add to hero banner with auto-incrementing order
- Toggle active/inactive without deleting
- Reorder by changing display_order number
- Delete unwanted banners

### 5. Database Schema

```sql
hero_banners
├── id (UUID, Primary Key)
├── movie_id (UUID, FK to movies)
├── series_id (UUID, FK to series)
├── display_order (INTEGER)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

**Constraints:**
- Either movie_id OR series_id must be set (not both)
- Cascade delete when movie/series is deleted

### 6. Security
- RLS enabled
- Public can view active banners
- Only admins can add/edit/delete
- Validates admin role from users table

## 🎯 Usage Tips

1. **Order Matters**: Lower numbers appear first (1, 2, 3...)
2. **Active Toggle**: Temporarily hide banners without deleting
3. **Backdrop Required**: Only items with backdrop_url will display
4. **Fallback**: If no banners exist, component shows loading state

## 🔧 Troubleshooting

**No banners showing?**
- Check if any banners are marked as active
- Verify movies/series have backdrop_url
- Check browser console for errors

**Can't add banners?**
- Ensure you're logged in as admin
- Verify RLS policies are created
- Check users table has role='admin'

## 📱 Responsive Design
- Mobile: 60vh height, center carousel
- Desktop: 75vh height, right-aligned carousel
- Smooth scroll with hidden scrollbar
- Touch-friendly thumbnail navigation
