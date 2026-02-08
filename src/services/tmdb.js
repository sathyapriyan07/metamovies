import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: TMDB_API_KEY
  }
});

export const getMovieDetails = async (tmdbId) => {
  const { data } = await tmdbApi.get(`/movie/${tmdbId}`, {
    params: { append_to_response: 'credits,videos,external_ids' }
  });
  return data;
};

export const getSeriesDetails = async (tmdbId) => {
  const { data } = await tmdbApi.get(`/tv/${tmdbId}`, {
    params: { append_to_response: 'credits,videos,external_ids' }
  });
  return data;
};

export const getSeasonDetails = async (seriesId, seasonNumber) => {
  const { data } = await tmdbApi.get(`/tv/${seriesId}/season/${seasonNumber}`);
  return data;
};

export const getPersonDetails = async (tmdbId) => {
  const { data } = await tmdbApi.get(`/person/${tmdbId}`, {
    params: { append_to_response: 'combined_credits,external_ids' }
  });
  return data;
};

export const searchMulti = async (query) => {
  const { data } = await tmdbApi.get('/search/multi', {
    params: { query }
  });
  return data.results;
};

export const searchMovies = async (query) => {
  const { data } = await tmdbApi.get('/search/movie', {
    params: { query }
  });
  return data.results;
};

export const searchSeries = async (query) => {
  const { data } = await tmdbApi.get('/search/tv', {
    params: { query }
  });
  return data.results;
};

export const getTrendingMovies = async () => {
  const { data } = await tmdbApi.get('/trending/movie/week');
  return data.results;
};

export const getTrendingSeries = async () => {
  const { data } = await tmdbApi.get('/trending/tv/week');
  return data.results;
};

export const getUpcomingMovies = async () => {
  const { data } = await tmdbApi.get('/movie/upcoming');
  return data.results;
};

export const getImageUrl = (path, size = 'original') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export default tmdbApi;
