-- Add booking metadata to movies
ALTER TABLE movies
  ADD COLUMN IF NOT EXISTS is_now_showing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_url text,
  ADD COLUMN IF NOT EXISTS booking_label text DEFAULT 'Book Tickets',
  ADD COLUMN IF NOT EXISTS booking_last_updated timestamp;
