# Fix 404 on Vercel for Dynamic Routes

## Problem
Refreshing dynamic routes like `/movie/123`, `/person/456`, `/series/789` returns 404 on Vercel deployment, even though client-side navigation works.

## Root Cause
React Router uses client-side routing. When you refresh a page, Vercel tries to find a physical file at that path and returns 404 if it doesn't exist.

## Solution

### ✅ Step 1: Create vercel.json
Already created in project root with:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This tells Vercel to serve `index.html` for ALL routes, allowing React Router to handle routing.

---

### ✅ Step 2: Deploy to Vercel

#### Option A: Via Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

#### Option B: Via Git Integration
1. Push to GitHub:
   ```bash
   git add vercel.json
   git commit -m "fix: add vercel.json for SPA routing"
   git push
   ```

2. Vercel will auto-deploy

---

### ✅ Step 3: Clear Vercel Cache (If Needed)

If still getting 404 after deploy:

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → General
4. Scroll to "Build & Development Settings"
5. Click "Clear Cache"
6. Redeploy

---

## How It Works

### Before (404 Error):
```
User visits: /movie/123
  ↓
Vercel looks for: /movie/123.html
  ↓
Not found → 404
```

### After (Works):
```
User visits: /movie/123
  ↓
vercel.json rewrites to: /index.html
  ↓
React loads → React Router handles /movie/123
  ↓
Page renders correctly
```

---

## Verify It Works

After deployment, test these URLs directly in browser:

- `https://your-app.vercel.app/movie/1`
- `https://your-app.vercel.app/series/1`
- `https://your-app.vercel.app/person/1`
- `https://your-app.vercel.app/profile`
- `https://your-app.vercel.app/admin`

All should load correctly (not 404).

---

## Alternative Solutions (Not Needed)

### If vercel.json doesn't work, try:

#### Option 1: Add _redirects file (for Netlify-style)
```
/*    /index.html   200
```

#### Option 2: Update vite.config.js
```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
```

---

## Common Issues

### Issue 1: Still getting 404
**Solution**: Clear Vercel cache and redeploy

### Issue 2: API routes not working
**Solution**: Add API routes to vercel.json:
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Issue 3: Static assets not loading
**Solution**: Ensure assets are in `public/` folder

---

## Project Structure

```
metamovies/
├── vercel.json          ← NEW (fixes 404)
├── index.html
├── src/
│   ├── App.jsx
│   └── pages/
│       ├── MovieDetail.jsx    (/movie/:id)
│       ├── SeriesDetail.jsx   (/series/:id)
│       ├── PersonDetail.jsx   (/person/:id)
│       └── Profile.jsx        (/profile)
└── package.json
```

---

## Summary

✅ **vercel.json created** - Rewrites all routes to index.html  
✅ **SPA routing enabled** - React Router handles all routes  
✅ **Direct URL access works** - No more 404 on refresh  
✅ **Client navigation preserved** - Fast, no page reload  

**Deploy and test!** 🚀
