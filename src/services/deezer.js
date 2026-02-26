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
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || `Deezer error ${res.status}`;
    throw new Error(msg);
  }
  return json;
};

export const searchDeezer = async (type, query) => {
  const cleaned = String(query || '').trim();
  if (!cleaned) return { data: [] };
  const safeType = ['album', 'track', 'artist'].includes(type) ? type : 'track';
  return fetchJson(`/search/${safeType}?q=${encodeURIComponent(cleaned)}`);
};

export const getDeezerAlbum = async (id) => fetchJson(`/album/${id}`);
export const getDeezerTrack = async (id) => fetchJson(`/track/${id}`);
export const getDeezerArtist = async (id) => fetchJson(`/artist/${id}`);
