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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100 pb-24">
      {/* Hero Banner */}
      {hero && (
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
          <img
            src={hero.backdrop_url || hero.poster_url}
            alt={hero.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 space-y-3">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{hero.title}</h1>
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
              <p className="text-sm text-zinc-300 line-clamp-2 max-w-2xl leading-relaxed">{hero.overview}</p>
            )}
            <div className="flex gap-3 pt-2">
              <button className="bg-amber-400 text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-amber-500 transition">
                Watch Now
              </button>
              <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-white/30 transition">
                + Watchlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections */}
      <div className="px-4 space-y-6 mt-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-400">Loading...</p>
          </div>
        ) : (
          <>
            {/* Movie Collections */}
            {collections.length > 0 && collections.map((collection) => (
              <section key={collection.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-zinc-200">
                    {collection.name || 'Collection'}
                  </h2>
                  <button 
                    className="text-sm text-amber-400 hover:underline"
                    onClick={() => navigate('/movies')}
                  >
                    See All
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
                  {collection.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="w-28 flex-shrink-0 snap-start cursor-pointer group"
                      onClick={() => navigate(`/movie/${item.id}`)}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md bg-zinc-800">
                        {typeof item.rating === 'number' && (
                          <div className="absolute top-1.5 right-1.5 bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
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
                      <p className="mt-1.5 text-xs text-zinc-300 line-clamp-2 leading-tight">
                        {item.title || item.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {item.release_date?.split('-')[0]}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Latest Series Section */}
            {seriesItems.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-zinc-200">
                    Latest TV Shows
                  </h2>
                  <button 
                    className="text-sm text-amber-400 hover:underline"
                    onClick={() => navigate('/series')}
                  >
                    See All
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
                  {seriesItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="w-28 flex-shrink-0 snap-start cursor-pointer group"
                      onClick={() => navigate(`/series/${item.id}`)}
                    >
                      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-md bg-zinc-800">
                        {typeof item.rating === 'number' && (
                          <div className="absolute top-1.5 right-1.5 bg-amber-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
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
                      <p className="mt-1.5 text-xs text-zinc-300 line-clamp-2 leading-tight">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {item.first_air_date?.split('-')[0]}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {collections.length === 0 && seriesItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-zinc-400">No content available yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

};

export default Home;
