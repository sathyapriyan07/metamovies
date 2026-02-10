import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      external_links(*)
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

// Series
export const getSeries = async (limit = 20, offset = 0) => {
  if (limit === null || limit === 0) {
    let allSeries = [];
    let from = 0;
    const batchSize = 1000;
    
    while (true) {
      const { data } = await supabase
        .from('series')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, from + batchSize - 1);
      
      if (!data || data.length === 0) break;
      allSeries = [...allSeries, ...data];
      if (data.length < batchSize) break;
      from += batchSize;
    }
    
    return { data: allSeries, error: null };
  }
  
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
    .select(`
      *,
      seasons(*, episodes(*)),
      cast:"cast"(*, person:persons(*)),
      crew:crew(*, person:persons(*)),
      external_links(*)
    `)
    .eq('id', id)
    .single();
  return { data, error };
};

export const getTrendingSeries = async () => {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('trending', true)
    .limit(20);
  return { data, error };
};

// Persons
export const getPersonById = async (id) => {
  const { data, error } = await supabase
    .from('persons')
    .select(`
      *,
      cast_roles:"cast"(*, movie:movies(*), series:series(*)),
      crew_roles:crew(*, movie:movies(*), series:series(*))
    `)
    .eq('id', id)
    .single();
  return { data, error };
};

// Search
export const searchAll = async (query) => {
  const [movies, series, persons] = await Promise.all([
    supabase.from('movies').select('*').ilike('title', `%${query}%`).limit(100),
    supabase.from('series').select('*').ilike('title', `%${query}%`).limit(100),
    supabase.from('persons').select('*').ilike('name', `%${query}%`).limit(100)
  ]);
  return { movies: movies.data, series: series.data, persons: persons.data };
};

// Watchlist
export const getWatchlist = async (userId) => {
  const { data, error } = await supabase
    .from('watchlist')
    .select(`
      *,
      movie:movies(*),
      series:series(*)
    `)
    .eq('user_id', userId);
  return { data, error };
};

export const addToWatchlist = async (userId, itemId, itemType) => {
  const { data, error } = await supabase
    .from('watchlist')
    .insert({
      user_id: userId,
      movie_id: itemType === 'movie' ? itemId : null,
      series_id: itemType === 'series' ? itemId : null
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
  } else {
    query.eq('series_id', itemId);
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
  } else {
    query.eq('series_id', itemId);
  }
  
  const { data } = await query.single();
  return !!data;
};

// Admin functions
export const createMovie = async (movieData) => {
  const { data, error } = await supabase.from('movies').insert(movieData).select().single();
  return { data, error };
};

export const updateMovie = async (id, movieData) => {
  const { data, error } = await supabase.from('movies').update(movieData).eq('id', id).select().single();
  return { data, error };
};

export const deleteMovie = async (id) => {
  const { error } = await supabase.from('movies').delete().eq('id', id);
  return { error };
};

export const createSeries = async (seriesData) => {
  const { data, error } = await supabase.from('series').insert(seriesData).select().single();
  return { data, error };
};

export const updateSeries = async (id, seriesData) => {
  const { data, error } = await supabase.from('series').update(seriesData).eq('id', id).select().single();
  return { data, error };
};

export const deleteSeries = async (id) => {
  const { error } = await supabase.from('series').delete().eq('id', id);
  return { error };
};

export const createPerson = async (personData) => {
  const { data, error } = await supabase.from('persons').insert(personData).select().single();
  return { data, error };
};

export const createSeason = async (seasonData) => {
  const { data, error } = await supabase.from('seasons').insert(seasonData).select().single();
  return { data, error };
};

export const createEpisode = async (episodeData) => {
  const { data, error } = await supabase.from('episodes').insert(episodeData).select().single();
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
        movie:movies(*),
        series:series(*)
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

export const addToCollection = async (collectionId, itemId, itemType) => {
  const { data, error } = await supabase.from('collection_items').insert({
    collection_id: collectionId,
    movie_id: itemType === 'movie' ? itemId : null,
    series_id: itemType === 'series' ? itemId : null
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
      movie:movies(*),
      series:series(*)
    `)
    .eq('is_active', true)
    .order('display_order', { ascending: true });
  return { data, error };
};
