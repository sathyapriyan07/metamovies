const API_BASE = import.meta.env.VITE_SONGLINK_API_BASE || 'https://api.song.link/v1-alpha.1';
const API_KEY = import.meta.env.VITE_SONGLINK_API_KEY || '';

const buildUrl = (params) => {
  const usp = new URLSearchParams(params);
  if (API_KEY) usp.set('key', API_KEY);
  return `${API_BASE}/links?${usp.toString()}`;
};

const fetchJson = async (url) => {
  const res = await fetch(url);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || `Songlink error ${res.status}`;
    throw new Error(msg);
  }
  return json;
};

export const getSonglinkLinks = async ({ platform, type, id, userCountry = 'US', songIfSingle = true }) => {
  const url = buildUrl({
    platform,
    type,
    id,
    userCountry,
    songIfSingle: songIfSingle ? 'true' : 'false'
  });
  return fetchJson(url);
};

export const extractLinksByPlatform = (data) => {
  const links = {};
  const linksByPlatform = data?.linksByPlatform || {};
  Object.entries(linksByPlatform).forEach(([platform, value]) => {
    if (value?.url) links[platform] = value.url;
  });
  return links;
};
