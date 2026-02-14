# Title Logo Feature Implementation

## Overview
The title logo feature allows movies to display official logos instead of text titles on the Movie Detail Page, providing a premium OTT-style experience similar to Netflix and Apple TV.

## Database Changes
Run the migration file `title-logo-migration.sql` to add the required fields:
- `title_logo_url`: TEXT field for storing the logo image URL
- `use_text_title`: BOOLEAN field to force text display even when logo exists

## Frontend Implementation

### Movie Detail Page
- Displays logo image when `title_logo_url` exists and `use_text_title` is false
- Automatically falls back to text title if logo fails to load or doesn't exist
- Responsive sizing: 64px (mobile) to 128px (desktop) max height
- Maintains semantic `<h1>` for SEO even when hidden
- Includes subtle blue glow shadow effect

### Admin Panel
- New "Title Logo" button in ManageMovies interface
- Modal with live preview of logo
- URL validation (requires HTTPS)
- Option to force text title display
- Support for PNG/SVG with transparent backgrounds

## Usage Instructions

### For Admins
1. Go to Admin → Manage Movies
2. Click "Title Logo" button on any movie
3. Enter logo URL (preferably PNG/SVG with transparent background)
4. Preview appears automatically
5. Optionally check "Force use text title instead" to override logo
6. Click "Save Logo"

### Recommended Logo Specifications
- Format: PNG or SVG with transparent background
- Orientation: Landscape preferred
- Max file size: 500KB recommended
- Aspect ratio: Flexible but landscape works best
- Background: Transparent for best results

## Display Priority
1. If `title_logo_url` exists AND `use_text_title` is false → Show logo
2. If logo fails to load → Fallback to text title
3. If no logo URL or `use_text_title` is true → Show text title
4. If no title → Show "Untitled"

## Responsive Behavior
- Mobile: max-h-16 (64px) with 12px bottom margin
- Tablet: max-h-24 (96px) with 16px bottom margin  
- Desktop: max-h-32 (128px) with 16px bottom margin
- Logo is center-aligned above movie details
- Uses `object-contain` to prevent stretching

## Accessibility
- Proper alt text: "{movie.title} logo"
- Maintains semantic HTML structure
- Fallback text always available
- No layout shift when switching between logo/text

## Technical Details
- Uses error handling to gracefully fallback to text
- Implements proper responsive classes
- Maintains existing styling and animations
- No breaking changes to existing functionality