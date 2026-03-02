import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getHeroBanners,
  getCollections,
  getCollectionWithItems,
  getSeries
} from '../services/supabase';

const Home = () => {
  const navigate = useNavigate();
  const [heroBanners, setHeroBanners] = useState([]);
  const [collections, setCollections] = useState([]);
  const [seriesItems, setSeriesItems] = useState([]);
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
    await Promise.all([loadSeries()]);
    setLoading(false);
  };

  const loadSeries = async () => {
    const { data } = await getSeries(12, 0);
    setSeriesItems(data || []);
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
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Hero Banner */}
      {hero && (
        <div className="relative h-[70vh] flex items-end overflow-hidden w-full">
          <img
            src={hero.backdrop_url || hero.poster_url}
            alt={hero.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-8 space-y-4 max-w-xl w-full">
            <h1 className="text-2xl font-semibold tracking-tight text-white">{hero.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <span>{hero.release_date?.split('-')[0]}</span>
              {hero.runtime && (
                <>
                  <span>•</span>
                  <span>{formatRuntime(hero.runtime)}</span>
                </>
              )}
              {hero.genres?.length > 0 && (
                <>
                  <span>•</span>
                  <span>{hero.genres.slice(0, 3).join(', ')}</span>
                </>
              )}
            </div>
            {hero.overview && (
              <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">{hero.overview}</p>
            )}
            <div className="flex gap-4 pt-2 flex-wrap">
              <button className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition">
                Watch Now
              </button>
              <button className="bg-zinc-800 border border-zinc-700 text-white px-6 py-3 rounded-xl hover:bg-zinc-700 transition">
                + Watchlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-400 text-sm">Loading...</p>
          </div>
        ) : (
          <>
            {/* Movie Collections */}
            {collections.length > 0 && collections.map((collection) => (
              <section key={collection.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {collection.name || 'Collection'}
                  </h2>
                  <button 
                    className="text-sm text-yellow-500 hover:text-yellow-400 transition"
                    onClick={() => navigate('/movies')}
                  >
                    See All
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
                  {collection.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="w-32 flex-shrink-0 snap-start cursor-pointer group"
                      onClick={() => navigate(`/movie/${item.id}`)}
                    >
                      <div className="space-y-2">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900">
                          {typeof item.rating === 'number' && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-md z-10">
                              {item.rating.toFixed(1)}
                            </div>
                          )}
                          <img
                            src={item.poster_url || item.backdrop_url}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white line-clamp-2 leading-tight">
                            {item.title || item.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {item.release_date?.split('-')[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Latest Series Section */}
            {seriesItems.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Latest TV Shows
                  </h2>
                  <button 
                    className="text-sm text-yellow-500 hover:text-yellow-400 transition"
                    onClick={() => navigate('/series')}
                  >
                    See All
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
                  {seriesItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="w-32 flex-shrink-0 snap-start cursor-pointer group"
                      onClick={() => navigate(`/series/${item.id}`)}
                    >
                      <div className="space-y-2">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900">
                          {typeof item.rating === 'number' && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-md z-10">
                              {item.rating.toFixed(1)}
                            </div>
                          )}
                          <img
                            src={item.poster_url || item.backdrop_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white line-clamp-2 leading-tight">
                            {item.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {item.first_air_date?.split('-')[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {collections.length === 0 && seriesItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-zinc-400 text-sm">No content available yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

};

export default Home;
