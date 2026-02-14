import { useEffect, useMemo, useState } from 'react';
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
    { id: 'collections', label: 'Collections' }
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <HeroBanner />

      {/* Category Tabs - Mobile Only */}
      <div className="md:hidden px-4 pt-6 pb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap snap-start transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white/15 backdrop-blur border border-[#3ba7ff]/50 text-white shadow-[0_0_16px_rgba(59,167,255,0.3)]'
                  : 'bg-white/5 backdrop-blur border border-white/10 text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-4">
        {/* Mobile: Show based on active tab */}
        <div className="md:hidden">
          {activeTab === 'trending' && (
            <CarouselRow title="Trending" items={trendingMovies} type="movie" loading={loading} />
          )}
          {activeTab === 'upcoming' && (
            <CarouselRow title="Upcoming" items={upcomingMovies} type="movie" loading={loading} />
          )}
          {activeTab === 'collections' && collections.map((collection) => (
            <CarouselRow
              key={collection.id}
              title={collection.name}
              items={collection.items}
              type={collection.items[0]?.type || 'movie'}
              loading={loading}
            />
          ))}
        </div>

        {/* Desktop: Show all */}
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

