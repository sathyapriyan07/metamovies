const API_BASE = import.meta.env.VITE_DEEZER_API_BASE
  || (import.meta.env.DEV ? '/deezer' : 'https://api.deezer.com');
const API_PROXY = import.meta.env.VITE_DEEZER_API_PROXY || '';

const buildUrl = (path) => {
  const url = `${API_BASE}${path}`;
  if (API_PROXY) {
    return `${API_PROXY}${encodeURIComponent(url)}`;
  }
  return url;
};

const fetchJson = async (path) => {
  const res = await fetch(buildUrl(path));
  if (!res.ok) {
    throw new Error(`Deezer error ${res.status}`);
  }
  return res.json();
};

export const searchDeezer = async (type, query) => {
  const q = encodeURIComponent(query);
  return fetchJson(`/search/${type}?q=${q}`);
};

export const getDeezerAlbum = async (id) => fetchJson(`/album/${id}`);
export const getDeezerTrack = async (id) => fetchJson(`/track/${id}`);
export const getDeezerArtist = async (id) => fetchJson(`/artist/${id}`);
