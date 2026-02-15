import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
const platformMovieCache = new Map();
const personVideoCache = new Map();

// Auth functions
export const signUp = async (email, password, username, avatarUrl = '') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        username,
        avatar_url: avatarUrl
      }
    }
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Movies
export const getMovies = async (limit = 20, offset = 0) => {
  if (limit === null || limit === 0) {
    let allMovies = [];
    let from = 0;
    const batchSize = 1000;
    
    while (true) {
      const { data } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + batchSize - 1);
      
      if (!data || data.length === 0) break;
      allMovies = [...allMovies, ...data];
      if (data.length < batchSize) break;
      from += batchSize;
    }
    
    return { data: allMovies, error: null };
  }
  
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  return { data, error };
};

export const getMovieById = async (id) => {
  const { data, error } = await supabase
    .from('movies')
    .select(`
      *,
      cast:"cast"(*, person:persons(*)),
      crew:crew(*, person:persons(*)),
      external_links(*),
      movie_platforms(*, platform:platforms(*))
    `)
    .eq('id', id)
    .single();
  return { data, error };
};

export const getTrendingMovies = async () => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .eq('trending', true)
    .limit(20);
  return { data, error };
};

export const getUpcomingMovies = async () => {
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .gte('release_date', new Date().toISOString())
    .order('release_date', { ascending: true })
    .limit(20);
  return { data, error };
};

// Music (tracks)
export const getMusic = async (limit = 20, offset = 0) => {
  if (limit === null || limit === 0) {
    let allMusic = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
      const { data } = await supabase
        .from('tracks')
        .select('*, album:albums(*, artist:artists(*))')
        .order('created_at', { ascending: false })
        .range(from, from + batchSize - 1);

      if (!data || data.length === 0) break;
      allMusic = [...allMusic, ...data];
      if (data.length < batchSize) break;
      from += batchSize;
    }

    return { data: allMusic, error: null };
  }

  const { data, error } = await supabase
    .from('tracks')
    .select('*, album:albums(*, artist:artists(*))')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { data, error };
};

export const getMusicById = async (id) => {
  const { data, error } = await supabase
    .from('tracks')
    .select('*, album:albums(*, artist:artists(*))')
    .eq('id', id)
    .single();
  return { data, error };
};

export const getArtistById = async (id) => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

export const getArtists = async () => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getAlbumsByArtist = async (artistId) => {
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('artist_id', artistId)
    .order('release_year', { ascending: false });
  return { data, error };
};

export const getTracksByArtist = async (artistId) => {
  const { data: albums } = await supabase
    .from('albums')
    .select('id')
    .eq('artist_id', artistId);
  const albumIds = (albums || []).map((a) => a.id);
  if (albumIds.length === 0) return { data: [], error: null };
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .in('album_id', albumIds);
  return { data, error };
};

export const getAlbumById = async (id) => {
  const { data, error } = await supabase
    .from('albums')
    .select('*, artist:artists(*)')
    .eq('id', id)
    .single();
  return { data, error };
};

export const getTracksByAlbum = async (albumId) => {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('album_id', albumId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getAlbums = async () => {
  const { data, error } = await supabase
    .from('albums')
    .select('*, artist:artists(*)')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getTracks = async () => {
  const { data, error } = await supabase
    .from('tracks')
    .select('*, album:albums(*, artist:artists(*))')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const upsertArtist = async (payload) => {
  const { data, error } = await supabase
    .from('artists')
    .upsert(payload)
    .select()
    .single();
  return { data, error };
};

export const updateArtist = async (id, payload) => {
  const { data, error } = await supabase
    .from('artists')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteArtist = async (id) => {
  const { error } = await supabase.from('artists').delete().eq('id', id);
  return { error };
};

export const upsertAlbum = async (payload) => {
  const { data, error } = await supabase
    .from('albums')
    .upsert(payload)
    .select()
    .single();
  return { data, error };
};

export const updateAlbum = async (id, payload) => {
  const { data, error } = await supabase
    .from('albums')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteAlbum = async (id) => {
  const { error } = await supabase.from('albums').delete().eq('id', id);
  return { error };
};

export const upsertTrack = async (payload) => {
  const { data, error } = await supabase
    .from('tracks')
    .upsert(payload)
    .select()
    .single();
  return { data, error };
};

export const updateTrack = async (id, payload) => {
  const { data, error } = await supabase
    .from('tracks')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteTrack = async (id) => {
  const { error } = await supabase.from('tracks').delete().eq('id', id);
  return { error };
};

// Persons
export const getPersonById = async (id) => {
  const { data, error } = await supabase
    .from('persons')
    .select(`
      *,
      cast_roles:"cast"(*, movie:movies(*)),
      crew_roles:crew(*, movie:movies(*))
    `)
    .eq('id', id)
    .single();
  return { data, error };
};

// Search
export const searchAll = async (query) => {
  const [movies, persons] = await Promise.all([
    supabase.from('movies').select('*').ilike('title', `%${query}%`).limit(100),
    supabase.from('persons').select('*').ilike('name', `%${query}%`).limit(100)
  ]);
  return { movies: movies.data, persons: persons.data };
};

// Watchlist
export const getWatchlist = async (userId) => {
  const { data, error } = await supabase
    .from('watchlist')
    .select(`
      *,
      movie:movies(*),
      music:tracks(*, album:albums(*, artist:artists(*)))
    `)
    .eq('user_id', userId);
  return { data, error };
};

export const addToWatchlist = async (userId, itemId, itemType) => {
  if (itemType === 'music') {
    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        user_id: userId,
        music_id: itemId,
      });
    return { data, error };
  }
  const { data, error } = await supabase
    .from('watchlist')
    .insert({
      user_id: userId,
      movie_id: itemId,
    });
  return { data, error };
};

export const removeFromWatchlist = async (userId, itemId, itemType) => {
  const query = supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId);
  
  if (itemType === 'movie') {
    query.eq('movie_id', itemId);
  } else if (itemType === 'music') {
    query.eq('music_id', itemId);
  }
  
  const { error } = await query;
  return { error };
};

export const isInWatchlist = async (userId, itemId, itemType) => {
  const query = supabase
    .from('watchlist')
    .select('id')
    .eq('user_id', userId);
  
  if (itemType === 'movie') {
    query.eq('movie_id', itemId);
  } else if (itemType === 'music') {
    query.eq('music_id', itemId);
  }
  
  const { data } = await query.single();
  return !!data;
};

// Admin functions
export const createMovie = async (movieData) => {
  const { data, error } = await supabase.from('movies').insert(movieData).select().single();
  return { data, error };
};

export const getFeaturedVideosByPerson = async (personId, limit = 8) => {
  const normalizedPersonId = Number(personId);
  const queryPersonId = Number.isNaN(normalizedPersonId) ? personId : normalizedPersonId;
  const cacheKey = `${queryPersonId}:${limit}`;
  if (personVideoCache.has(cacheKey)) return { data: personVideoCache.get(cacheKey), error: null };

  const { data, error } = await supabase
    .from('featured_video_persons')
    .select(`
      role,
      video:videos(*)
    `)
    .eq('person_id', queryPersonId)
    .order('created_at', { ascending: false })
    .limit(limit);

  const videos = (data || [])
    .map((item) => ({
      ...(item.video || {}),
      person_role: item.role || null
    }))
    .filter((item) => item.id);

  if (!error) personVideoCache.set(cacheKey, videos);
  return { data: videos, error };
};

export const updateMovie = async (id, movieData) => {
  const { data, error } = await supabase.from('movies').update(movieData).eq('id', id).select().single();
  return { data, error };
};

export const deleteMovie = async (id) => {
  const { error } = await supabase.from('movies').delete().eq('id', id);
  return { error };
};

export const setFeaturedVideoPersons = async (videoId, persons = []) => {
  const { error: deleteError } = await supabase
    .from('featured_video_persons')
    .delete()
    .eq('featured_video_id', videoId);

  if (deleteError) return { data: null, error: deleteError };

  if (!persons.length) return { data: [], error: null };

  const rows = persons.map((person) => ({
    featured_video_id: videoId,
    person_id: person.id,
    role: person.role || null
  }));

  const { data, error } = await supabase.from('featured_video_persons').insert(rows).select();
  if (!error) {
    personVideoCache.clear();
  }
  return { data, error };
};

export const getPlatforms = async ({ activeOnly = true } = {}) => {
  let query = supabase
    .from('platforms')
    .select('*')
    .order('name', { ascending: true });
  if (activeOnly) query = query.eq('is_active', true);
  const { data, error } = await query;
  return { data, error };
};

export const getPlatformById = async (id) => {
  const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

export const getPlatformsByMovie = async (movieId) => {
  const { data, error } = await supabase
    .from('movie_platforms')
    .select('platform_id, platform:platforms(*)')
    .eq('movie_id', movieId)
    .order('platform_id', { ascending: true });
  return { data, error };
};

export const getMoviesByPlatform = async (platformId, limit = 20, offset = 0) => {
  const cacheKey = `${platformId}:${limit}:${offset}`;
  if (platformMovieCache.has(cacheKey)) return { data: platformMovieCache.get(cacheKey), error: null };

  const { data, error } = await supabase
    .from('movie_platforms')
    .select('movie:movies(*)')
    .eq('platform_id', platformId)
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1);

  const movies = (data || []).map((item) => item.movie).filter(Boolean);
  if (!error) platformMovieCache.set(cacheKey, movies);
  return { data: movies, error };
};

export const createPlatform = async (platformData) => {
  const { data, error } = await supabase.from('platforms').insert(platformData).select().single();
  return { data, error };
};

export const updatePlatform = async (id, platformData) => {
  const { data, error } = await supabase.from('platforms').update(platformData).eq('id', id).select().single();
  return { data, error };
};

export const deletePlatform = async (id) => {
  const { error } = await supabase.from('platforms').delete().eq('id', id);
  return { error };
};

export const setMoviePlatforms = async (movieId, platformIds = []) => {
  const { error: deleteError } = await supabase.from('movie_platforms').delete().eq('movie_id', movieId);
  if (deleteError) return { error: deleteError };

  const cleanedIds = [...new Set((platformIds || []).map((s) => Number(s)).filter(Boolean))];
  if (cleanedIds.length === 0) return { data: [], error: null };

  const rows = cleanedIds.map((platformId) => ({ movie_id: movieId, platform_id: platformId }));
  const { data, error } = await supabase.from('movie_platforms').insert(rows).select();
  platformMovieCache.clear();
  return { data, error };
};

export const createMusic = async (musicData) => {
  const artistName = (musicData.artist || '').trim();
  const albumTitle = (musicData.album || '').trim();

  let artistId = null;
  if (artistName) {
    const { data: existing } = await supabase
      .from('artists')
      .select('*')
      .eq('name', artistName)
      .single();
    if (existing?.id) {
      artistId = existing.id;
    } else {
      const { data: created } = await supabase
        .from('artists')
        .insert({
          name: artistName,
          profile_image_url: musicData.artist_image_url || null,
          banner_image_url: musicData.artist_banner_url || null,
          bio: musicData.artist_bio || null,
          tags: musicData.artist_tags || null,
          social_links: musicData.artist_social_links || null,
          import_source: musicData.import_source || null,
          is_imported: !!musicData.is_imported,
          last_synced_at: musicData.last_synced_at || null
        })
        .select()
        .single();
      artistId = created?.id || null;
    }
  }

  let albumId = null;
  if (albumTitle && artistId) {
    const { data: existingAlbum } = await supabase
      .from('albums')
      .select('*')
      .eq('title', albumTitle)
      .eq('artist_id', artistId)
      .single();
    if (existingAlbum?.id) {
      albumId = existingAlbum.id;
    } else {
      const { data: createdAlbum } = await supabase
        .from('albums')
        .insert({
          title: albumTitle,
          artist_id: artistId,
          cover_image_url: musicData.cover_image_url || null,
          release_year: musicData.release_year || null,
          total_duration_seconds: musicData.total_duration_seconds || null,
          spotify_url: musicData.spotify_url || null,
          apple_music_url: musicData.apple_music_url || null,
          youtube_music_url: musicData.youtube_music_url || null,
          amazon_music_url: musicData.amazon_music_url || null,
          import_source: musicData.import_source || null,
          is_imported: !!musicData.is_imported,
          last_synced_at: musicData.last_synced_at || null
        })
        .select()
        .single();
      albumId = createdAlbum?.id || null;
    }
  }

  const { data, error } = await supabase.from('tracks').insert({
    album_id: albumId,
    title: musicData.title,
    duration_seconds: musicData.duration_seconds || null,
    preview_url: musicData.preview_url || null,
    artwork_url: musicData.artwork_url || null,
    spotify_url: musicData.spotify_url || null,
    apple_music_url: musicData.apple_music_url || null,
    youtube_music_url: musicData.youtube_music_url || null,
    amazon_music_url: musicData.amazon_music_url || null,
    import_source: musicData.import_source || null,
    is_imported: !!musicData.is_imported,
    last_synced_at: musicData.last_synced_at || null
  }).select().single();
  return { data, error };
};

export const updateMusic = async (id, musicData) => {
  const { data, error } = await supabase.from('tracks').update({
    title: musicData.title,
    duration_seconds: musicData.duration_seconds || null,
    preview_url: musicData.preview_url || null,
    artwork_url: musicData.artwork_url || null,
    spotify_url: musicData.spotify_url || null,
    apple_music_url: musicData.apple_music_url || null,
    youtube_music_url: musicData.youtube_music_url || null,
    amazon_music_url: musicData.amazon_music_url || null
  }).eq('id', id).select().single();
  return { data, error };
};

export const deleteMusic = async (id) => {
  const { error } = await supabase.from('tracks').delete().eq('id', id);
  return { error };
};

export const createPerson = async (personData) => {
  const { data, error } = await supabase.from('persons').insert(personData).select().single();
  return { data, error };
};

export const createCast = async (castData) => {
  const { data, error } = await supabase.from('cast').insert(castData).select().single();
  return { data, error };
};

export const createCrew = async (crewData) => {
  const { data, error } = await supabase.from('crew').insert(crewData).select().single();
  return { data, error };
};

// Storage
export const uploadImage = async (file, bucket, path) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) return { data: null, error };
  
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return { data: publicUrl, error: null };
};

export const getImageUrl = (bucket, path) => {
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
};

// Collections
export const getCollections = async () => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('display_order', { ascending: true });
  return { data, error };
};

export const getCollectionWithItems = async (id) => {
  const { data, error } = await supabase
    .from('collections')
    .select(`
      *,
      collection_items(
        *,
        movie:movies(*)
        )
    `)
    .eq('id', id)
    .single();
  return { data, error };
};

export const createCollection = async (name) => {
  const { data, error } = await supabase.from('collections').insert({ name }).select().single();
  return { data, error };
};

export const deleteCollection = async (id) => {
  const { error } = await supabase.from('collections').delete().eq('id', id);
  return { error };
};

export const addToCollection = async (collectionId, itemId) => {
  const { data, error } = await supabase.from('collection_items').insert({
    collection_id: collectionId,
    movie_id: itemId,
  });
  return { data, error };
};

export const removeFromCollection = async (collectionItemId) => {
  const { error } = await supabase.from('collection_items').delete().eq('id', collectionItemId);
  return { error };
};

// Hero Banners
export const getHeroBanners = async () => {
  const { data, error } = await supabase
    .from('hero_banners')
    .select(`
      *,
      movie:movies(*)
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  return { data, error };
};
