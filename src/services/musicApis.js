const ITUNES_BASE = 'https://itunes.apple.com';
const DEEZER_BASE = 'https://api.deezer.com';
const MUSICBRAINZ_BASE = 'https://musicbrainz.org/ws/2';

const normalizeItunesTrack = (item) => {
  const releaseYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : null;
  return {
    api: 'itunes',
    id: item.trackId,
    title: item.trackName,
    artist: item.artistName,
    album: item.collectionName,
    duration_seconds: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : null,
    release_year: releaseYear,
    cover_url: item.artworkUrl100?.replace('100x100', '600x600') || item.artworkUrl100,
    preview_url: item.previewUrl || null,
    artist_id: item.artistId,
    album_id: item.collectionId
  };
};

const normalizeItunesAlbum = (item) => {
  const releaseYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : null;
  return {
    api: 'itunes',
    type: 'album',
    id: item.collectionId,
    title: item.collectionName,
    artist: item.artistName,
    album: item.collectionName,
    duration_seconds: null,
    release_year: releaseYear,
    cover_url: item.artworkUrl100?.replace('100x100', '600x600') || item.artworkUrl100,
    preview_url: null,
    artist_id: item.artistId,
    album_id: item.collectionId
  };
};

const normalizeItunesArtist = (item) => ({
  api: 'itunes',
  type: 'artist',
  id: item.artistId,
  title: item.artistName,
  artist: item.artistName,
  album: null,
  duration_seconds: null,
  release_year: null,
  cover_url: null,
  preview_url: null,
  artist_id: item.artistId,
  album_id: null
});

export const searchItunes = async (query, entity = 'song', limit = 20) => {
  const url = new URL(`${ITUNES_BASE}/search`);
  url.searchParams.set('term', query);
  url.searchParams.set('entity', entity);
  url.searchParams.set('limit', limit.toString());

  const res = await fetch(url.toString());
  const data = await res.json();
  if (entity === 'album') return (data.results || []).map(normalizeItunesAlbum);
  if (entity === 'musicArtist') return (data.results || []).map(normalizeItunesArtist);
  return (data.results || []).map((item) => ({ ...normalizeItunesTrack(item), type: 'track' }));
};

export const lookupItunes = async (id, entity = 'song') => {
  const url = new URL(`${ITUNES_BASE}/lookup`);
  url.searchParams.set('id', id);
  url.searchParams.set('entity', entity);
  const res = await fetch(url.toString());
  const data = await res.json();
  if (entity === 'album') return (data.results || []).map(normalizeItunesAlbum);
  if (entity === 'musicArtist') return (data.results || []).map(normalizeItunesArtist);
  return (data.results || []).map((item) => ({ ...normalizeItunesTrack(item), type: 'track' }));
};

export const apiProviders = [
  { id: 'itunes', label: 'iTunes', supported: true },
  { id: 'deezer', label: 'Deezer', supported: false },
  { id: 'musicbrainz', label: 'MusicBrainz', supported: false }
];
