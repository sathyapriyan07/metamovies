import { useEffect, useState } from 'react';
import {
  getTrendingMovies, getUpcomingMovies,
  getMovies,
  getCollections,
  getCollectionWithItems
} from '../services/supabase';
import CarouselRow from '../components/CarouselRow';
import HeroBanner from '../components/HeroBanner';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');
  const [activeCollection, setActiveCollection] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [trending, upcoming, movies, cols] = await Promise.all([
      getTrendingMovies(),
      getUpcomingMovies(),
      getMovies(40, 0),
      getCollections()
    ]);

    setTrendingMovies(trending.data || []);
    setUpcomingMovies(upcoming.data || []);
    setAllMovies(movies.data || []);

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

  const tabs = [
    { id: 'trending', label: 'Trending' },
    { id: 'upcoming', label: 'Upcoming' },
    ...collections.slice(0, 6).map(col => ({ id: `collection-${col.id}`, label: col.name, collection: col }))
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <HeroBanner />

      <div className="md:hidden px-4 pt-6 pb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setActiveCollection(tab.collection || null);
              }}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-250 snap-start ${
                activeTab === tab.id
                  ? 'bg-white/[0.18] border border-white/35 text-white shadow-[0_4px_18px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-[22px]'
                  : 'bg-white/[0.05] border border-white/[0.12] text-slate-300 hover:bg-white/[0.08] backdrop-blur-[10px]'
              }`}
              style={activeTab === tab.id ? { textShadow: '0 1px 2px rgba(0,0,0,0.6)' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-4">
        <div className="md:hidden">
          {activeTab === 'trending' && (
            <CarouselRow title="Trending" items={trendingMovies} type="movie" loading={loading} />
          )}
          {activeTab === 'upcoming' && (
            <CarouselRow title="Upcoming" items={upcomingMovies} type="movie" loading={loading} />
          )}
          {activeCollection && (
            <CarouselRow
              title={activeCollection.name}
              items={activeCollection.items}
              type={activeCollection.items[0]?.type || 'movie'}
              loading={loading}
            />
          )}
        </div>

        <div className="hidden md:block">
          <CarouselRow title="Trending" items={trendingMovies} type="movie" loading={loading} />
          <CarouselRow title="Upcoming" items={upcomingMovies} type="movie" loading={loading} />
          {collections.map((collection) => (
            <CarouselRow
              key={collection.id}
              title={collection.name}
              items={collection.items}
              type={collection.items[0]?.type || 'movie'}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
