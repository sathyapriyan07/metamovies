-- New modules: Soundtrack, Ratings/Reviews, Trending, Release Calendar, Follow/Notifications, Share Cards, SEO
-- Run in Supabase SQL editor

BEGIN;

-- SOUNDTRACK EXTENSIONS (reuse albums/tracks with movie linkage + song roles)
ALTER TABLE albums ADD COLUMN IF NOT EXISTS movie_id BIGINT REFERENCES movies(id) ON DELETE SET NULL;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS label TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE albums ADD COLUMN IF NOT EXISTS release_date DATE;

ALTER TABLE tracks ADD COLUMN IF NOT EXISTS track_no INTEGER;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS youtube_official_url TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS jiosaavn_url TEXT;

CREATE TABLE IF NOT EXISTS song_artists (
  id BIGSERIAL PRIMARY KEY,
  song_id BIGINT REFERENCES tracks(id) ON DELETE CASCADE,
  person_id BIGINT REFERENCES persons(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('composer', 'singer', 'lyricist')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(song_id, person_id, role)
);

CREATE INDEX IF NOT EXISTS idx_albums_movie ON albums(movie_id);
CREATE INDEX IF NOT EXISTS idx_song_artists_song ON song_artists(song_id);
CREATE INDEX IF NOT EXISTS idx_song_artists_person ON song_artists(person_id);

ALTER TABLE song_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read song_artists" ON song_artists FOR SELECT USING (true);
CREATE POLICY "Admin manage song_artists" ON song_artists FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- USER RATINGS & REVIEWS
CREATE TABLE IF NOT EXISTS ratings (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(movie_id, user_id)
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_likes (
  id BIGSERIAL PRIMARY KEY,
  review_id BIGINT REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_movie ON ratings(movie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_movie ON reviews(movie_id);
CREATE INDEX IF NOT EXISTS idx_review_likes_review ON review_likes(review_id);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Public read review_likes" ON review_likes FOR SELECT USING (true);

CREATE POLICY "Users upsert own ratings" ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own ratings" ON ratings FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own ratings" ON ratings FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own reviews" ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON reviews FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own reviews" ON reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users like reviews" ON review_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove like" ON review_likes FOR DELETE
  USING (auth.uid() = user_id);

-- TRENDING ENGINE
CREATE TABLE IF NOT EXISTS view_events (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('movie', 'person', 'song')),
  entity_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS search_events (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  user_id UUID REFERENCES users(id),
  searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trending_weekly (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('movie', 'person', 'song')),
  entity_id TEXT NOT NULL,
  week_start DATE NOT NULL,
  score INTEGER NOT NULL,
  metrics JSONB NOT NULL,
  UNIQUE(entity_type, entity_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_view_events_entity ON view_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_search_events_query ON search_events(query);
CREATE INDEX IF NOT EXISTS idx_trending_weekly_week ON trending_weekly(week_start);

ALTER TABLE view_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_weekly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert view events" ON view_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert search events" ON search_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read trending weekly" ON trending_weekly FOR SELECT USING (true);
CREATE POLICY "Admin manage trending weekly" ON trending_weekly FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- RELEASE CALENDAR
CREATE TABLE IF NOT EXISTS releases (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  release_type TEXT NOT NULL CHECK (release_type IN ('theatre', 'ott')),
  platform_id BIGINT REFERENCES platforms(id),
  language TEXT,
  release_date DATE NOT NULL,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_releases_date ON releases(release_date);
CREATE INDEX IF NOT EXISTS idx_releases_movie ON releases(movie_id);

ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read releases" ON releases FOR SELECT USING (true);
CREATE POLICY "Admin manage releases" ON releases FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- FOLLOW + NOTIFICATIONS
CREATE TABLE IF NOT EXISTS follows (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('person', 'platform')),
  entity_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_movie_for_followed_person', 'news_for_followed_person')),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_follows_user ON follows(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage follows" ON follows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin insert notifications" ON notifications FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- SHARE CARD GENERATOR
CREATE TABLE IF NOT EXISTS share_cards (
  id BIGSERIAL PRIMARY KEY,
  movie_id BIGINT REFERENCES movies(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(movie_id)
);

ALTER TABLE share_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read share_cards" ON share_cards FOR SELECT USING (true);
CREATE POLICY "Admin manage share_cards" ON share_cards FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- SEO ENHANCEMENTS
CREATE TABLE IF NOT EXISTS slugs (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('movie', 'person', 'song', 'album', 'platform', 'news')),
  entity_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  UNIQUE(entity_type, slug)
);

CREATE TABLE IF NOT EXISTS page_meta (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  title TEXT,
  description TEXT,
  jsonld JSONB,
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_slugs_entity ON slugs(entity_type, entity_id);

ALTER TABLE slugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read slugs" ON slugs FOR SELECT USING (true);
CREATE POLICY "Public read page_meta" ON page_meta FOR SELECT USING (true);
CREATE POLICY "Admin manage slugs" ON slugs FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
CREATE POLICY "Admin manage page_meta" ON page_meta FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

COMMIT;
