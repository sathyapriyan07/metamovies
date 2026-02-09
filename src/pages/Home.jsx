import { useEffect, useState } from 'react';
import { getTrendingMovies, getTrendingSeries, getUpcomingMovies, getMovies, getCollections, getCollectionWithItems } from '../services/supabase';
import PosterRow from '../components/PosterRow';
import HeroBanner from '../components/HeroBanner';
import HomeSearchBar from '../components/HomeSearchBar';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [trending, series, upcoming, cols] = await Promise.all([
      getTrendingMovies(),
      getTrendingSeries(),
      getUpcomingMovies(),
      getCollections()
    ]);
    
    setTrendingMovies(trending.data || []);
    setTrendingSeries(series.data || []);
    setUpcomingMovies(upcoming.data || []);
    
    // Load collection items
    const collectionsWithItems = await Promise.all(
      (cols.data || []).map(async (col) => {
        const { data } = await getCollectionWithItems(col.id);
        return {
          ...col,
          items: data?.collection_items?.map(item => ({
            ...(item.movie || item.series),
            type: item.movie ? 'movie' : 'series'
          })) || []
        };
      })
    );
    setCollections(collectionsWithItems);
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Top Black Header with Search Bar */}
      <div className="w-full bg-black pt-16 md:pt-20 pb-3 px-4">
        <HomeSearchBar />
      </div>
      
      {/* Hero Banner */}
      <HeroBanner />
      
      {/* Content Rows */}
      <div className="max-w-7xl mx-auto pt-8">
        <PosterRow title="Trending Movies" items={trendingMovies} type="movie" loading={loading} />
        <PosterRow title="Trending Series" items={trendingSeries} type="series" loading={loading} />
        <PosterRow title="Upcoming Movies" items={upcomingMovies} type="movie" loading={loading} />
        
        {/* Custom Collections */}
        {collections.map((collection) => (
          <PosterRow
            key={collection.id}
            title={collection.name}
            items={collection.items}
            type={collection.items[0]?.type || 'movie'}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
