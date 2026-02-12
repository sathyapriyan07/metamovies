# MetaMovies - IMDb/TMDB-Inspired Design Specification

## 🎯 Overview

This document provides a complete blueprint for refactoring MetaMovies UI to match the structural polish of IMDb and TMDB while maintaining the unique dark cinematic branding.

**Preserve:**
- Dark cinematic theme
- Electric blue accent (#3ba7ff)
- Space Grotesk headings
- Manrope body font
- Supabase backend
- React Router structure
- Existing components

**Adopt from IMDb/TMDB:**
- Layout structure
- Spacing system
- Information hierarchy
- UX patterns
- Content organization

---

## 🎨 Global Design System

### Spacing Scale (8px base)
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
3xl: 64px
```

### Container Widths
```
max-width: 1320px (desktop)
padding: 16px (mobile)
padding: 32px (tablet)
padding: 48px (desktop)
```

### Border Radius
```
sm: 8px (chips, small buttons)
md: 12px (cards, inputs)
lg: 16px (large cards)
xl: 20px (hero sections)
```

### Typography Scale
```
xs: 12px (metadata, labels)
sm: 14px (body, base)
base: 16px (paragraphs)
lg: 18px (subheadings)
xl: 24px (section titles)
2xl: 32px (page titles)
3xl: 48px (hero titles)
```

### Colors
```
Background: #04060b (deep navy)
Surface: rgba(7, 12, 22, 0.7) (glass cards)
Accent: #3ba7ff (electric blue)
Text Primary: #ffffff
Text Secondary: #a0aec0
Text Muted: #718096
Border: rgba(255, 255, 255, 0.1)
```

---

## 📐 Layout Patterns

### 1. Hero Sections (IMDb Style)

#### Desktop Layout
```
┌─────────────────────────────────────────┐
│  Blurred Backdrop Image                 │
│  ┌──────────┐  ┌──────────────────┐    │
│  │  Poster  │  │  Title           │    │
│  │  Image   │  │  Year • Genre    │    │
│  │          │  │  Rating Logos    │    │
│  │          │  │  Overview        │    │
│  │          │  │  [Buttons]       │    │
│  └──────────┘  └──────────────────┘    │
└─────────────────────────────────────────┘
```

#### Mobile Layout
```
┌──────────────────┐
│  Backdrop        │
│  ┌────────────┐  │
│  │   Poster   │  │
│  │   Center   │  │
│  └────────────┘  │
│                  │
│  Title           │
│  Metadata        │
│  Overview        │
│  [Buttons]       │
└──────────────────┘
```

### 2. Content Grids (TMDB Style)

#### Poster Grid
```
Desktop: 6 columns
Tablet: 4 columns
Mobile: 3 columns

Gap: 16px
Aspect Ratio: 2:3
Hover: Scale 1.05 + Blue glow
```

#### Cast Grid
```
Desktop: 6 per row
Tablet: 4 per row
Mobile: 3 per row

Circular avatars: 120px
Name: 14px semibold
Role: 12px muted
```

### 3. Horizontal Rows (IMDb Carousel)

```
Snap scroll behavior
Padding: 16px sides
Gap: 12px
Show 2.5 items on mobile
Show 6 items on desktop
Navigation arrows on hover (desktop)
```

---

## 📄 Page-by-Page Specifications

### Home Page

#### Structure
```
1. Sticky Header (glass blur)
2. Hero Banner (full-width)
   - Auto-rotate every 5s
   - Swipe on mobile
   - Pagination dots
3. Trending Movies (horizontal row)
4. Popular Series (horizontal row)
5. Upcoming (horizontal row)
6. Collections (horizontal rows)
```

#### Hero Banner Details
- Height: 60vh (desktop), 50vh (mobile)
- Gradient: from-black/90 via-black/60 to-transparent
- Title: 48px (desktop), 32px (mobile)
- Overview: 3 lines max with ellipsis
- Buttons: Primary (Trailer) + Ghost (Watchlist)

---

### Movie/Series Detail Page

#### Hero Section
```html
<section class="relative h-[65vh]">
  <!-- Backdrop -->
  <img class="absolute inset-0 w-full h-full object-cover" />
  
  <!-- Gradient Overlay -->
  <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60" />
  
  <!-- Content Container -->
  <div class="relative max-w-7xl mx-auto px-6 h-full flex items-end pb-12">
    <!-- Poster (left) -->
    <div class="w-48 -mb-24">
      <img class="rounded-xl shadow-2xl" />
    </div>
    
    <!-- Info (right) -->
    <div class="flex-1 ml-8">
      <h1 class="text-5xl font-bold">Title</h1>
      <div class="flex gap-3 mt-3">
        <span>2024</span>
        <span>•</span>
        <span>Action</span>
        <span>•</span>
        <span>2h 30m</span>
      </div>
    </div>
  </div>
</section>
```

#### Content Section
```html
<div class="max-w-7xl mx-auto px-6 mt-32">
  <!-- Tab Navigation -->
  <nav class="border-b border-white/10 mb-8">
    <button class="tab-item">Overview</button>
    <button class="tab-item">Cast</button>
    <button class="tab-item">Crew</button>
    <button class="tab-item">Links</button>
  </nav>
  
  <!-- Tab Content -->
  <div class="grid grid-cols-12 gap-8">
    <!-- Main Content (8 cols) -->
    <div class="col-span-8">
      <!-- Overview -->
      <section class="glass-card p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">Overview</h2>
        <p class="text-gray-300 leading-relaxed">...</p>
      </section>
      
      <!-- Cast -->
      <section class="mb-8">
        <h2 class="text-2xl font-semibold mb-4">Cast</h2>
        <div class="grid grid-cols-6 gap-4">
          <!-- Cast cards -->
        </div>
      </section>
    </div>
    
    <!-- Sidebar (4 cols) -->
    <aside class="col-span-4">
      <!-- Ratings -->
      <div class="glass-card p-6 mb-6">
        <h3 class="font-semibold mb-4">Ratings</h3>
        <!-- Rating logos -->
      </div>
      
      <!-- Streaming -->
      <div class="glass-card p-6 mb-6">
        <h3 class="font-semibold mb-4">Watch Now</h3>
        <!-- Platform buttons -->
      </div>
    </aside>
  </div>
</div>
```

---

### Person Detail Page (IMDb Style)

#### Structure
```
1. Banner Header (backdrop image)
2. Profile Section
   - Circular avatar (200px)
   - Name (3xl)
   - Known for (text-muted)
3. Biography (glass card, expandable)
4. Known For Carousel
5. Filmography Grid
   - Tabs: Movies / Series
   - Grouped by year
```

#### Profile Section
```html
<section class="relative">
  <!-- Banner -->
  <div class="h-64 bg-gradient-to-b from-blue-900/20" />
  
  <!-- Profile -->
  <div class="max-w-7xl mx-auto px-6 -mt-24">
    <div class="flex items-end gap-6">
      <img class="w-48 h-48 rounded-full border-4 border-black" />
      <div class="pb-4">
        <h1 class="text-4xl font-bold">Name</h1>
        <p class="text-gray-400">Actor • Director</p>
      </div>
    </div>
  </div>
</section>
```

---

### Movies/Series Grid Page

#### Layout
```
┌─────────────────────────────────────┐
│  Header + Search                    │
├──────────┬──────────────────────────┤
│ Filters  │  Poster Grid             │
│ Sidebar  │  ┌───┬───┬───┬───┬───┐  │
│          │  │   │   │   │   │   │  │
│ Genre    │  ├───┼───┼───┼───┼───┤  │
│ Year     │  │   │   │   │   │   │  │
│ Rating   │  └───┴───┴───┴───┴───┘  │
│          │                          │
│ [Apply]  │  [Load More]             │
└──────────┴──────────────────────────┘
```

#### Filter Sidebar (Desktop)
```html
<aside class="w-64 glass-card p-6">
  <h3 class="font-semibold mb-4">Filters</h3>
  
  <!-- Genre -->
  <div class="mb-6">
    <label class="text-sm font-medium mb-2">Genre</label>
    <select class="glass-input w-full">...</select>
  </div>
  
  <!-- Year -->
  <div class="mb-6">
    <label class="text-sm font-medium mb-2">Year</label>
    <input type="range" class="w-full" />
  </div>
  
  <button class="btn-primary w-full">Apply</button>
</aside>
```

#### Filter Chips (Mobile)
```html
<div class="flex gap-2 overflow-x-auto pb-4">
  <button class="chip">All</button>
  <button class="chip">Action</button>
  <button class="chip">Drama</button>
  <button class="chip">Comedy</button>
</div>
```

---

## 🧩 Component Specifications

### PosterCard (TMDB Style)

```jsx
<div class="poster-card group">
  <div class="relative aspect-[2/3] overflow-hidden rounded-lg">
    <img class="w-full h-full object-cover transition-transform group-hover:scale-105" />
    
    <!-- Hover Overlay -->
    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-yellow-400">⭐ 8.5</span>
      </div>
      <button class="btn-ghost btn-sm">+ Watchlist</button>
    </div>
  </div>
  
  <div class="mt-2">
    <h3 class="font-semibold text-sm truncate">Title</h3>
    <p class="text-xs text-gray-400">2024</p>
  </div>
</div>
```

### CastCard (IMDb Style)

```jsx
<div class="cast-card text-center">
  <img class="w-24 h-24 rounded-full mx-auto mb-3 object-cover" />
  <h4 class="font-semibold text-sm">Actor Name</h4>
  <p class="text-xs text-gray-400">Character</p>
</div>
```

### Platform Button

```jsx
<a class="platform-btn">
  <img class="h-6 w-auto" src="netflix-logo.svg" />
</a>

/* CSS */
.platform-btn {
  @apply inline-flex items-center justify-center h-12 px-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all;
}
```

### Rating Badge (IMDb Style)

```jsx
<div class="flex items-center gap-4">
  <div class="flex items-center gap-2">
    <img src="tmdb-logo.svg" class="h-6" />
    <span class="text-lg font-semibold">8.5</span>
  </div>
  <div class="flex items-center gap-2">
    <img src="imdb-logo.svg" class="h-5" />
    <span class="text-lg font-semibold">7.9</span>
  </div>
</div>
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Large phones */
md: 768px   /* Tablets */
lg: 1024px  /* Small laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Responsive Grid
```
Mobile: grid-cols-3 gap-3
Tablet: grid-cols-4 gap-4
Desktop: grid-cols-6 gap-4
```

---

## 🎭 Animation & Transitions

### Hover Effects
```css
.poster-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(59, 167, 255, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 32px rgba(59, 167, 255, 0.4);
}
```

### Page Transitions
```css
.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 300ms ease-out;
}
```

---

## ♿ Accessibility

### Focus States
```css
.btn:focus-visible {
  outline: 2px solid #3ba7ff;
  outline-offset: 2px;
}

.glass-input:focus {
  border-color: #3ba7ff;
  ring: 2px solid rgba(59, 167, 255, 0.3);
}
```

### ARIA Labels
```html
<button aria-label="Add to watchlist">+</button>
<img alt="Movie poster for Inception" />
<nav aria-label="Main navigation">...</nav>
```

---

## 🚀 Performance

### Image Optimization
```jsx
<img 
  loading="lazy" 
  decoding="async"
  srcset="poster-300.jpg 300w, poster-600.jpg 600w"
  sizes="(max-width: 768px) 100vw, 300px"
/>
```

### Lazy Loading
```jsx
import { lazy, Suspense } from 'react';

const MovieDetail = lazy(() => import('./pages/MovieDetail'));

<Suspense fallback={<SkeletonLoader />}>
  <MovieDetail />
</Suspense>
```

---

## 📦 Implementation Priority

### Phase 1: Core Pages (Week 1)
1. ✅ MovieDetail (already done)
2. SeriesDetail
3. Home page hero
4. Navigation header

### Phase 2: Browse Pages (Week 2)
1. Movies grid
2. Series grid
3. Search page
4. Filter sidebar

### Phase 3: Profile Pages (Week 3)
1. PersonDetail
2. User Profile
3. Watchlist

### Phase 4: Admin Pages (Week 4)
1. Admin dashboard
2. Management pages
3. Forms & inputs

---

## 🎯 Key Differences from Current Design

### What Changes
- Hero layout (left-aligned vs centered)
- Sidebar on detail pages
- Filter sidebar on grid pages
- Circular cast avatars
- Rating badge design
- Tab navigation style

### What Stays
- Dark theme
- Blue accent
- Glassmorphism
- Typography
- Component architecture
- Routing structure

---

## 📚 Reference Examples

### IMDb Patterns to Adopt
- Left-aligned hero with poster
- Sidebar with metadata
- Circular cast photos
- Filmography grouping
- Rating display

### TMDB Patterns to Adopt
- Poster grid layout
- Horizontal carousels
- Filter chips
- Platform logos
- Clean spacing

### MetaMovies Unique Elements
- Dark cinematic theme
- Blue glow effects
- Glassmorphism cards
- Space Grotesk typography
- Radial gradient backgrounds

---

## ✅ Success Criteria

- [ ] Matches IMDb/TMDB structural polish
- [ ] Maintains MetaMovies branding
- [ ] Responsive on all devices
- [ ] Accessible (WCAG AA)
- [ ] Fast performance (<3s load)
- [ ] Smooth animations
- [ ] Clean code architecture

---

**This specification provides the complete blueprint for refactoring MetaMovies to IMDb/TMDB standards while preserving your unique identity.**
