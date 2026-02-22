import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getHeroBanners,
  getCollections,
  getCollectionWithItems
} from '../services/supabase';

const Home = () => {
  const navigate = useNavigate();
  const [heroBanners, setHeroBanners] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [hero, cols] = await Promise.all([
      getHeroBanners(),
      getCollections()
    ]);

    const sortedHero = (hero.data || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    setHeroBanners(sortedHero);

    const collectionsWithItems = await Promise.all(
      (cols.data || []).map(async (col) => {
        const { data } = await getCollectionWithItems(col.id);
        return {
          ...col,
          items:
            data?.collection_items?.map((item) => ({
              ...(item.movie || {}),
              type: 'movie'
            })) || []
        };
      })
    );
    setCollections(collectionsWithItems);
    setLoading(false);
  };

  const hero = heroBanners[0]?.movie || null;
  const formatRuntime = (mins) => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-10">
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {hero ? (
          <div className="bg-[#1a1a1a] rounded-md overflow-hidden">
            <div>
              <img
                src={hero.backdrop_url || hero.poster_url}
                alt={hero.title}
                className="w-full h-[220px] object-cover rounded-md"
                loading="eager"
              />
            </div>
            <div className="p-4">
              <h1 className="text-2xl font-bold">{hero.title}</h1>
              <div className="text-sm text-gray-400 mt-3 flex flex-wrap items-center gap-2">
                <span>{hero.release_date?.split('-')[0]}</span>
                {hero.runtime ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gray-500" aria-hidden="true" />
                    <span>{formatRuntime(hero.runtime)}</span>
                  </>
                ) : null}
                {hero.genres?.length ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gray-500" aria-hidden="true" />
                    <span>{hero.genres.join(' • ')}</span>
                  </>
                ) : null}
              </div>
              {hero.overview && (
                <p className="text-gray-300 mt-4 max-w-xl text-sm">
                  {hero.overview}
                </p>
              )}
              <div className="flex gap-3 mt-4">
                <button className="bg-[#F5C518] text-black px-4 py-2 rounded-md text-sm font-medium">
                  Watch Trailer
                </button>
                <button className="bg-[#1a1a1a] text-white px-4 py-2 rounded-md text-sm border border-white/10">
                  + Watchlist
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] rounded-md p-4">
            <h1 className="text-2xl font-bold">Featured Title</h1>
            <p className="text-sm text-gray-400 mt-2">Add a Hero Banner in admin to show it here.</p>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {loading ? (
          <p className="py-6">Loading...</p>
        ) : collections.length > 0 ? (
          collections.map((collection) => (
            <section key={collection.id} className="py-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{collection.name || 'Collection'}</h2>
                <button className="text-sm text-[#F5C518]" onClick={() => navigate('/movies')}>See All</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {collection.items.slice(0, 8).map((item) => (
                  <div key={item.id} className="cursor-pointer" onClick={() => navigate(`/movie/${item.id}`)}>
                    <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[#1a1a1a]">
                      {typeof item.rating === 'number' && (
                        <div className="absolute top-2 left-2 bg-[#F5C518] text-black text-xs font-semibold px-2 py-0.5 rounded">
                          {item.rating.toFixed(1)}
                        </div>
                      )}
                      <img
                        src={item.poster_url || item.backdrop_url}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-2 text-sm font-medium truncate">{item.title || item.name}</p>
                    <p className="text-xs text-gray-400">{item.release_date?.split('-')[0]}</p>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="py-6 text-sm text-gray-400">No featured content added yet.</div>
        )}
      </div>
    </div>
  );

};

export default Home;
