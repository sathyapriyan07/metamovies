import { useEffect, useState } from 'react';
import { getTrendingMovies, getTrendingSeries, getUpcomingMovies, getMovies, getCollections, getCollectionWithItems } from '../services/supabase';
import PosterRow from '../components/PosterRow';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [streamingNow, setStreamingNow] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [trending, series, upcoming, streaming, cols] = await Promise.all([
      getTrendingMovies(),
      getTrendingSeries(),
      getUpcomingMovies(),
      getMovies(20, 0),
      getCollections()
    ]);
    
    setTrendingMovies(trending.data || []);
    setTrendingSeries(series.data || []);
    setUpcomingMovies(upcoming.data || []);
    setStreamingNow(streaming.data || []);
    
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
    <div className="min-h-screen pt-16 md:pt-16 pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
        <img
          src={trendingMovies[0]?.backdrop_url || 'https://via.placeholder.com/1920x1080'}
          alt="Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 line-clamp-2 leading-tight">
                {trendingMovies[0]?.title}
              </h1>
              <p className="text-base md:text-lg text-gray-300 mb-6 line-clamp-3 leading-relaxed">
                {trendingMovies[0]?.overview}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Rows */}
      <div className="max-w-7xl mx-auto">
        <PosterRow title="Trending Movies" items={trendingMovies} type="movie" loading={loading} />
        <PosterRow title="Trending Series" items={trendingSeries} type="series" loading={loading} />
        <PosterRow title="Upcoming Movies" items={upcomingMovies} type="movie" loading={loading} />
        <PosterRow title="Streaming Now" items={streamingNow} type="movie" loading={loading} />
        
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
