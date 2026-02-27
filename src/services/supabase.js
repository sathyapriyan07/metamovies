import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
const platformMovieCache = new Map();
const personVideoCache = new Map();
let videoPersonRelationConfig = null;

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

// Series
export const getSeries = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return { data, error };
};

export const getSeriesById = async (id) => {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

export const getSeriesByTmdbId = async (tmdbId) => {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('tmdb_id', tmdbId)
    .single();
  return { data, error };
};

export const getSeasonsBySeries = async (seriesId) => {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('series_id', seriesId)
    .order('season_number', { ascending: true });
  return { data, error };
};


export const getEpisodesBySeries = async (seriesId) => {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('series_id', seriesId)
    .order('season_id', { ascending: true })
    .order('episode_number', { ascending: true });
  return { data, error };
};

export const getEpisodesBySeason = async (seasonId) => {
  const { data, error } = await supabase
    .from('episodes')
    .select('*')
    .eq('season_id', seasonId)
    .order('episode_number', { ascending: true });
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

export const getPersons = async (limit = 20) => {
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
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
      crew_roles:crew(*, movie:movies(*)),
      series_cast_roles:series_cast(*, series:series(*)),
      series_crew_roles:series_crew(*, series:series(*))
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

export const searchSeries = async (query) => {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(100);
  return { data, error };
};

export const searchAllContent = async (query) => {
  const [movies, persons, series] = await Promise.all([
    supabase.from('movies').select('*').ilike('title', `%${query}%`).limit(100),
    supabase.from('persons').select('*').ilike('name', `%${query}%`).limit(100),
    supabase.from('series').select('*').ilike('name', `%${query}%`).limit(100),
  ]);
  return { movies: movies.data, persons: persons.data, series: series.data };
};

export const createSeries = async (payload) => {
  const { data, error } = await supabase
    .from('series')
    .upsert(payload, { onConflict: 'tmdb_id' })
    .select()
    .single();
  return { data, error };
};

export const createSeason = async (payload) => {
  const { data, error } = await supabase
    .from('seasons')
    .upsert(payload, { onConflict: 'series_id,season_number' })
    .select()
    .single();
  return { data, error };
};

export const createEpisode = async (payload) => {
  const { data, error } = await supabase
    .from('episodes')
    .upsert(payload, { onConflict: 'season_id,episode_number' })
    .select()
    .single();
  return { data, error };
};

export const createSeriesCast = async (payload) => {
  const { data, error } = await supabase
    .from('series_cast')
    .insert(payload)
    .select()
    .single();
  return { data, error };
};

export const createSeriesCrew = async (payload) => {
  const { data, error } = await supabase
    .from('series_crew')
    .insert(payload)
    .select()
    .single();
  return { data, error };
};

export const getPersonsByTmdbIds = async (tmdbIds = []) => {
  if (!tmdbIds.length) return { data: [], error: null };
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .in('tmdb_id', tmdbIds);
  return { data, error };
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

  const relationConfig = await resolveVideoPersonRelationConfig();
  if (!relationConfig) {
    return { data: [], error: new Error('No video-person relation table found') };
  }

  const { data, error } = await supabase
    .from(relationConfig.table)
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

export const getFeaturedVideos = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return { data, error };
};

export const getVideoById = async (id) => {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

export const getNews = async (limit = 20, offset = 0) => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return { data, error };
};

export const getNewsById = async (id) => {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

export const getPersonsByVideo = async (videoId) => {
  const relationConfig = await resolveVideoPersonRelationConfig();
  if (!relationConfig) {
    return { data: [], error: new Error('No video-person relation table found') };
  }

  const { data, error } = await supabase
    .from(relationConfig.table)
    .select(`
      role,
      persons (
        id,
        name,
        profile_url,
        profile_path,
        profile_image
      )
    `)
    .eq(relationConfig.videoForeignKey, videoId)
    .order('created_at', { ascending: true });

  return { data: data || [], error };
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
  const relationConfig = await resolveVideoPersonRelationConfig();
  if (!relationConfig) {
    return { data: null, error: new Error('No video-person relation table found') };
  }

  const cleanedPersons = [...new Map(
    (persons || [])
      .filter((person) => person && person.id !== null && person.id !== undefined)
      .map((person) => [String(person.id), person])
  ).values()];

  const { error: deleteError } = await supabase
    .from(relationConfig.table)
    .delete()
    .eq(relationConfig.videoForeignKey, videoId);

  if (deleteError) return { data: null, error: deleteError };

  if (!cleanedPersons.length) return { data: [], error: null };

  const rows = cleanedPersons.map((person) => ({
    [relationConfig.videoForeignKey]: videoId,
    person_id: person.id,
    role: person.role || null
  }));

  const { data, error } = await supabase.from(relationConfig.table).insert(rows).select();
  if (!error) {
    personVideoCache.clear();
  }
  return { data, error };
};

export const removeFeaturedVideoPersonLink = async (videoId, personId) => {
  const relationConfig = await resolveVideoPersonRelationConfig();
  if (!relationConfig) {
    return { data: null, error: new Error('No video-person relation table found') };
  }

  const { error } = await supabase
    .from(relationConfig.table)
    .delete()
    .eq(relationConfig.videoForeignKey, videoId)
    .eq('person_id', personId);

  if (!error) {
    personVideoCache.clear();
  }
  return { data: null, error };
};

const resolveVideoPersonRelationConfig = async () => {
  if (videoPersonRelationConfig) return videoPersonRelationConfig;

  const candidates = [
    { table: 'video_persons', videoForeignKey: 'video_id' },
    { table: 'featured_video_persons', videoForeignKey: 'featured_video_id' }
  ];

  for (const candidate of candidates) {
    const { error } = await supabase.from(candidate.table).select('person_id').limit(1);
    if (!error) {
      videoPersonRelationConfig = candidate;
      return candidate;
    }
  }

  return null;
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

// Soundtrack (albums/tracks mapped to movies)
export const getAlbumsByMovie = async (movieId) => {
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('movie_id', movieId)
    .order('release_date', { ascending: true });
  return { data, error };
};

export const getSoundtrackByMovie = async (movieId) => {
  const { data, error } = await supabase
    .from('albums')
    .select(`
      *,
      tracks (
        *,
        song_artists (
          role,
          person:persons (*)
        )
      )
    `)
    .eq('movie_id', movieId)
    .order('release_date', { ascending: true });
  return { data, error };
};

export const getSongById = async (id) => {
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      *,
      album:albums(*),
      song_artists (
        role,
        person:persons (*)
      )
    `)
    .eq('id', id)
    .single();
  return { data, error };
};

export const getSongsByAlbum = async (albumId) => {
  const { data, error } = await supabase
    .from('tracks')
    .select(`
      *,
      song_artists (
        role,
        person:persons (*)
      )
    `)
    .eq('album_id', albumId)
    .order('track_no', { ascending: true });
  return { data, error };
};

export const setSongArtists = async (songId, artists = []) => {
  const { error: deleteError } = await supabase
    .from('song_artists')
    .delete()
    .eq('song_id', songId);
  if (deleteError) return { data: null, error: deleteError };
  if (!artists.length) return { data: [], error: null };

  const rows = artists
    .filter((row) => row && row.person_id)
    .map((row) => ({
      song_id: songId,
      person_id: row.person_id,
      role: row.role || 'composer'
    }));
  const { data, error } = await supabase.from('song_artists').insert(rows).select();
  return { data, error };
};

// Ratings & Reviews
export const getMovieRatingsSummary = async (movieId) => {
  const { data: ratings } = await supabase
    .from('ratings')
    .select('rating')
    .eq('movie_id', movieId);
  const values = (ratings || []).map((r) => r.rating).filter(Boolean);
  if (values.length === 0) return { avg: null, count: 0 };
  const total = values.reduce((acc, v) => acc + v, 0);
  return { avg: total / values.length, count: values.length };
};

export const getUserRating = async (movieId, userId) => {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('movie_id', movieId)
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const upsertRating = async (movieId, userId, rating) => {
  const { data, error } = await supabase
    .from('ratings')
    .upsert({ movie_id: movieId, user_id: userId, rating })
    .select()
    .single();
  return { data, error };
};

export const getReviewsByMovie = async (movieId, sortBy = 'latest') => {
  const query = supabase
    .from('reviews')
    .select(`
      *,
      user:users ( id, username ),
      review_likes ( id, user_id )
    `)
    .eq('movie_id', movieId);

  if (sortBy === 'top') {
    query.order('rating', { ascending: false }).order('created_at', { ascending: false });
  } else {
    query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  return { data, error };
};

export const addReview = async (movieId, userId, body, rating = null) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ movie_id: movieId, user_id: userId, body, rating })
    .select()
    .single();
  return { data, error };
};

export const deleteReview = async (reviewId, userId) => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', userId);
  return { error };
};

export const likeReview = async (reviewId, userId) => {
  const { data, error } = await supabase
    .from('review_likes')
    .insert({ review_id: reviewId, user_id: userId })
    .select()
    .single();
  return { data, error };
};

export const unlikeReview = async (reviewId, userId) => {
  const { error } = await supabase
    .from('review_likes')
    .delete()
    .eq('review_id', reviewId)
    .eq('user_id', userId);
  return { error };
};

// Trending
export const recordViewEvent = async (entityType, entityId, userId = null) => {
  const { error } = await supabase
    .from('view_events')
    .insert({ entity_type: entityType, entity_id: String(entityId), user_id: userId });
  return { error };
};

export const recordSearchEvent = async (query, userId = null) => {
  const { error } = await supabase
    .from('search_events')
    .insert({ query, user_id: userId });
  return { error };
};

export const getWeeklyTrending = async (weekStart) => {
  const { data, error } = await supabase
    .from('trending_weekly')
    .select('*')
    .eq('week_start', weekStart)
    .order('score', { ascending: false });
  return { data, error };
};

export const getMostWatchlistedMovies = async (limit = 12) => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('movie_id, movie:movies(*)')
    .not('movie_id', 'is', null);
  if (error) return { data: [], error };
  const counts = new Map();
  (data || []).forEach((row) => {
    if (!row.movie_id) return;
    counts.set(row.movie_id, {
      movie: row.movie,
      count: (counts.get(row.movie_id)?.count || 0) + 1
    });
  });
  const sorted = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
  return { data: sorted, error: null };
};

export const getMostSearched = async (limit = 12) => {
  const { data, error } = await supabase
    .from('search_events')
    .select('query');
  if (error) return { data: [], error };
  const counts = new Map();
  (data || []).forEach((row) => {
    const key = (row.query || '').toLowerCase().trim();
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  const sorted = [...counts.entries()]
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
  return { data: sorted, error: null };
};

// Release Calendar
export const getReleasesByRange = async (startDate, endDate, { language, platformId } = {}) => {
  let query = supabase
    .from('releases')
    .select(`
      *,
      movie:movies(*),
      platform:platforms(*)
    `)
    .gte('release_date', startDate)
    .lte('release_date', endDate)
    .order('release_date', { ascending: true });

  if (language) query = query.eq('language', language);
  if (platformId) query = query.eq('platform_id', platformId);
  const { data, error } = await query;
  return { data, error };
};

// Follows + Notifications
export const followEntity = async (userId, entityType, entityId) => {
  const { data, error } = await supabase
    .from('follows')
    .insert({ user_id: userId, entity_type: entityType, entity_id: String(entityId) })
    .select()
    .single();
  return { data, error };
};

export const unfollowEntity = async (userId, entityType, entityId) => {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId);
  return { error };
};

export const getFollowStatus = async (userId, entityType, entityId) => {
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('user_id', userId)
    .eq('entity_type', entityType)
    .eq('entity_id', String(entityId))
    .single();
  return !!data;
};

export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getUnreadNotificationsCount = async (userId) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);
  return { count: count || 0, error };
};

export const markNotificationRead = async (notificationId, userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId);
  return { error };
};

export const markAllNotificationsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);
  return { error };
};

export const getFollowersForEntity = async (entityType, entityId) => {
  const { data, error } = await supabase
    .from('follows')
    .select('user_id')
    .eq('entity_type', entityType)
    .eq('entity_id', String(entityId));
  return { data, error };
};

export const createNotifications = async (rows = []) => {
  if (!rows.length) return { data: [], error: null };
  const { data, error } = await supabase.from('notifications').insert(rows).select();
  return { data, error };
};

// SEO helpers
export const resolveSlug = async (slug, entityType = null) => {
  let query = supabase
    .from('slugs')
    .select('*')
    .eq('slug', slug);
  if (entityType) query = query.eq('entity_type', entityType);
  const { data, error } = await query.single();
  return { data, error };
};

export const getPageMeta = async (entityType, entityId) => {
  const { data, error } = await supabase
    .from('page_meta')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .single();
  return { data, error };
};

// Share cards
export const getShareCardByMovie = async (movieId) => {
  const { data, error } = await supabase
    .from('share_cards')
    .select('*')
    .eq('movie_id', movieId)
    .single();
  return { data, error };
};

export const getMoviesByIds = async (ids = []) => {
  if (!ids.length) return { data: [], error: null };
  const { data, error } = await supabase
    .from('movies')
    .select('*')
    .in('id', ids);
  return { data, error };
};

export const getPersonsByIds = async (ids = []) => {
  if (!ids.length) return { data: [], error: null };
  const { data, error } = await supabase
    .from('persons')
    .select('*')
    .in('id', ids);
  return { data, error };
};

export const getSongsByIds = async (ids = []) => {
  if (!ids.length) return { data: [], error: null };
  const { data, error } = await supabase
    .from('tracks')
    .select('*, album:albums(*)')
    .in('id', ids);
  return { data, error };
};

// Admin helpers
export const adminDeleteReview = async (reviewId) => {
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  return { error };
};

export const upsertTrendingWeekly = async (payload) => {
  const { data, error } = await supabase
    .from('trending_weekly')
    .upsert(payload)
    .select()
    .single();
  return { data, error };
};

export const upsertSlug = async (payload) => {
  const { data, error } = await supabase
    .from('slugs')
    .upsert(payload)
    .select()
    .single();
  return { data, error };
};

export const upsertPageMeta = async (payload) => {
  const { data, error } = await supabase
    .from('page_meta')
    .upsert(payload)
    .select()
    .single();
  return { data, error };
};
