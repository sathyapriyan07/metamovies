# Admin Guide: Embed Link Management

## Quick Setup

### Step 1: Run Database Migration
Run `add-embed-links.sql` in Supabase SQL Editor to add the required columns.

### Step 2: Add Embed Links

#### For Movies
1. Go to **Admin Panel** → **Manage Movies**
2. Find your movie and click **"Embed Link"** button
3. Enter embed URL: `https://vidsrc.to/embed/movie/TMDB_ID`
4. Click **"Save Embed Link"**
5. ✅ Watch Now button appears on movie detail page

#### For Series Episodes
1. Go to **Admin Panel** → **Manage Series**
2. Select series from left panel
3. Click season button (S1, S2, etc.)
4. For each episode, enter embed URL in the **"Embed Link"** field
5. Tab/blur out to auto-save
6. ✅ Watch Episode button appears for that episode

## Embed URL Formats

### VidSrc (Recommended)
- **Movies**: `https://vidsrc.to/embed/movie/{tmdb_id}`
- **TV Shows**: `https://vidsrc.to/embed/tv/{tmdb_id}/{season}/{episode}`

Example:
- Movie: `https://vidsrc.to/embed/movie/550` (Fight Club)
- Episode: `https://vidsrc.to/embed/tv/1399/1/1` (Game of Thrones S01E01)

### Other Providers
- Any iframe-compatible embed URL works
- Must be http:// or https://
- Will be loaded in fullscreen modal player

## Tips

✅ **Do:**
- Use HTTPS URLs for security
- Test embed links before saving
- Use consistent provider for better UX

❌ **Don't:**
- Use direct video file URLs (use embed URLs)
- Mix different providers unnecessarily
- Leave embed_link empty if content is available

## Troubleshooting

**Button doesn't appear?**
- Check if embed_link is saved in database
- Verify URL is valid (http/https)
- Clear browser cache and reload

**Player shows error?**
- Verify embed URL works in browser
- Check if provider is blocking iframe
- Try different embed provider

**Episode not saving?**
- Make sure to blur/tab out of input field
- Check browser console for errors
- Verify admin permissions

## Database Fields

| Table | Column | Type | Description |
|-------|--------|------|-------------|
| movies | embed_link | TEXT | Iframe embed URL for movie |
| episodes | embed_link | TEXT | Iframe embed URL for episode |

Both fields are nullable and optional.
