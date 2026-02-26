import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const siteUrl = process.env.SITE_URL || 'https://your-domain.com';

const buildUrl = (path) => `${siteUrl.replace(/\/$/, '')}${path}`;

const buildRoutes = (slugs) => {
  const routes = [
    '/',
    '/movies',
    '/platforms',
    '/trending',
    '/calendar/releases',
    '/search',
    '/news',
    '/videos'
  ];

  for (const slug of slugs) {
    const base = (() => {
      switch (slug.entity_type) {
        case 'movie':
          return '/movie/';
        case 'person':
          return '/person/';
        case 'album':
          return '/albums/';
        case 'song':
          return '/songs/';
        case 'platform':
          return '/platforms/';
        case 'news':
          return '/news/';
        default:
          return null;
      }
    })();
    if (base) routes.push(`${base}${slug.slug}`);
  }

  return Array.from(new Set(routes));
};

const buildXml = (urls) => {
  const entries = urls
    .map((url) => `<url><loc>${url}</loc></url>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`;
};

const run = async () => {
  const { data, error } = await supabase.from('slugs').select('entity_type, slug');
  if (error) {
    console.error(error);
    process.exit(1);
  }
  const routes = buildRoutes(data || []);
  const xml = buildXml(routes.map((path) => buildUrl(path)));
  fs.writeFileSync('public/sitemap.xml', xml);
  console.log(`Generated sitemap with ${routes.length} routes`);
};

run();
