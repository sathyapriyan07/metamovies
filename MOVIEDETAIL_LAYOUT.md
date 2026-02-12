# MovieDetail Page - Google-Inspired Layout

## ✅ Implemented Features

### 1. Hero / Header Section
- **Blurred backdrop** with gradient overlay
- **Centered floating poster** with glow border
- **Movie title** in Space Grotesk (heading font)
- **Year • Genre • Runtime** inline metadata
- **Rating row** with TMDB/IMDb/Rotten Tomatoes logos
- **Action buttons**: Watchlist, Trailer, Book Tickets (if showing)

### 2. Tab Navigation
- **Horizontal pill tabs**: Cast, Crew, External Links
- **Active state**: Blue glow underline animation
- **Inactive state**: Glass dark background
- **Scrollable** on mobile
- **Smooth transitions**

### 3. Typography
- **Headings**: Space Grotesk (Google-style modern sans)
- **Body text**: Manrope (clean, readable)
- **Proper hierarchy**: Title → Metadata → Overview

### 4. Cast Section
- **Horizontal scroll** cards
- **Circular/rounded images**
- **Actor name** (Manrope 500)
- **Character name** muted
- **Responsive**: 3 per row mobile, 6 per row desktop

### 5. Where to Watch / Streaming
- **Glass card** container
- **Platform logo buttons**: Netflix, Prime, JioHotstar, ZEE5
- **Rounded rectangular** buttons with brand colors
- **Hover effects**: Scale + glow

### 6. Music Platforms
- **Reusable component**: MusicPlatforms.jsx
- **Platform buttons**: Spotify, Apple Music, YouTube Music, Amazon Music
- **Logo-based** design (no text-only)
- **Glassmorphism** style

### 7. Overview Section
- **Glass card** block
- **3-4 line clamp** (expandable)
- **Centered** on page
- **Max-width** for readability

### 8. Trailers Section
- **YouTube thumbnail** with play overlay
- **Hover effect**: Darkens background
- **Blue play button** with scale animation
- **Rounded corners** (2xl)

### 9. Color & Effects
- **Background**: Deep navy/black gradient with blue radial glows
- **Accent**: Electric blue (#3ba7ff)
- **Cards**: rgba glass blur with borders
- **Borders**: 1px white/10
- **Hover glow**: Blue soft shadow

### 10. Responsive Design
- **Mobile**: Single column, scrollable tabs, large centered poster
- **Desktop**: Two-column hero, grid cast, wider layout
- **Breakpoints**: Tailwind md: (768px)

---

## CSS Utility Classes

### Buttons
- `.btn-primary` - Blue gradient with glow
- `.btn-ghost` - Glass border with hover
- `.btn-ticket` - White button for BookMyShow
- `.btn-secondary` - Secondary glass button

### Cards
- `.glass-card` - Main card style
- `.glass-dark` - Darker variant
- `.glass-input` - Input fields
- `.poster-card` - Poster hover effects

### Typography
- `.section-title` - Section headings
- `.chip` - Genre/tag pills
- `.meta-separator` - Metadata dots

### Tabs
- `.tab-item` - Tab button
- `.tab-item-active` - Active tab with underline

### Platform Buttons
- `.platform-btn` - Music/streaming platform buttons
- `.platform-logo` - Logo sizing
- `.platform-label` - Hidden on mobile

---

## Admin Features
- **Edit Poster** button (blue)
- **Edit Backdrop** button (purple)
- **Modal popups** with preview
- **Glass card** modals

---

## Key Differences from Google
- **Dark cinematic theme** (not white)
- **Blue accent** (not Google colors)
- **Space Grotesk + Manrope** fonts (not Roboto)
- **Glassmorphism** cards (not Material Design)
- **Radial gradient** background (not solid)

---

## Layout Structure

```
Hero Section
  ├─ Blurred Backdrop
  ├─ Floating Poster (centered)
  └─ Gradient Overlay

Title Area (centered)
  ├─ "MOVIE" label
  ├─ Title + Year
  ├─ Genres (chips)
  ├─ Ratings (TMDB/IMDb/RT logos)
  ├─ Runtime
  ├─ Overview
  └─ Action Buttons

Tab Navigation
  ├─ Cast
  ├─ Crew
  └─ External Links

Tab Content
  ├─ Cast Grid/Scroll
  ├─ Crew Grid/Scroll
  └─ Links Section
      ├─ Watch Now (streaming)
      ├─ Trailer
      ├─ Download (Telegram)
      └─ Music Platforms
```

---

## Fonts

### Space Grotesk (Headings)
- Movie titles
- Section headers
- Bold, modern, geometric

### Manrope (Body)
- Metadata
- Cast names
- Descriptions
- Clean, readable, professional

---

## Result
✅ Google-style information hierarchy  
✅ Dark cinematic OTT theme  
✅ Blue accent palette  
✅ Glassmorphism cards  
✅ Modern typography  
✅ Responsive design  
✅ Smooth animations  
✅ Professional layout  

**Not a Google clone** - Structural inspiration only with MetaMovies branding!
