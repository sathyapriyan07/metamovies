# MetaMovies Setup Guide

## Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Supabase

1. Go to https://supabase.com and create account
2. Create new project (choose region close to you)
3. Wait for project to be ready (~2 minutes)
4. Go to SQL Editor (left sidebar)
5. Click "New Query"
6. Copy entire content from `supabase-schema.sql`
7. Paste and click "Run"
8. Go to Storage (left sidebar)
9. Click "Create bucket"
   - Name: `posters`, Public: ON
   - Name: `backdrops`, Public: ON
   - Name: `profiles`, Public: ON
10. Go to Settings → API
11. Copy "Project URL" and "anon public" key

### Step 3: Setup TMDB API

1. Go to https://www.themoviedb.org/signup
2. Create account and verify email
3. Go to Settings → API
4. Click "Request API Key"
5. Choose "Developer"
6. Fill form (can use dummy data for personal use)
7. Copy your API Key (v3 auth)

### Step 4: Create .env File

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_TMDB_API_KEY=your-tmdb-api-key-here
```

### Step 5: Run the App

```bash
npm run dev
```

Open http://localhost:5173

## Create Admin Account

1. Click "Sign Up" in the app
2. Create account with email/password
3. Go to Supabase Dashboard
4. Click "Authentication" → "Users"
5. Find your user, click the three dots → "Edit user"
6. In "User Metadata" section, add:
   ```json
   {
     "role": "admin"
   }
   ```
7. Click "Save"
8. Refresh the app
9. You'll now see "Admin" link in navbar

## Import Your First Movie

1. Login as admin
2. Click "Admin" in navbar
3. Click "TMDB Import"
4. Go to https://www.themoviedb.org/movie/550-fight-club
5. Copy the ID from URL (550)
6. Paste in "TMDB ID" field
7. Select "Movie"
8. Click "Fetch from TMDB"
9. Review the preview
10. Click "Import to Database"
11. Done! Go to home page to see it

## Popular TMDB IDs to Try

### Movies
- 550 - Fight Club
- 13 - Forrest Gump
- 155 - The Dark Knight
- 278 - The Shawshank Redemption
- 680 - Pulp Fiction

### TV Series
- 1396 - Breaking Bad
- 1399 - Game of Thrones
- 60735 - The Flash
- 66732 - Stranger Things
- 94605 - Arcane

## Troubleshooting

### "Failed to fetch from TMDB"
- Check your TMDB API key is correct
- Make sure you're using the movie/series ID, not the URL
- Try a different ID to verify API is working

### "Failed to import"
- Check Supabase connection
- Verify all storage buckets are created and public
- Check browser console for detailed errors

### "Not authenticated" errors
- Make sure you're logged in
- Check .env file has correct Supabase credentials
- Try logging out and back in

### Admin panel not showing
- Verify user metadata has `"role": "admin"`
- Refresh the page after adding admin role
- Check browser console for errors

## Next Steps

1. Import more movies and series
2. Customize the UI colors in `tailwind.config.js`
3. Add more features in admin panel
4. Deploy to production (Vercel/Netlify)

## Production Deployment

### Vercel (Recommended)
```bash
npm run build
```

1. Push code to GitHub
2. Go to vercel.com
3. Import repository
4. Add environment variables
5. Deploy

### Netlify
1. Run `npm run build`
2. Drag `dist` folder to netlify.com
3. Add environment variables in site settings

## Support

- Check README.md for detailed documentation
- Review code comments for implementation details
- Open GitHub issue for bugs

---

Happy coding! 🎬
