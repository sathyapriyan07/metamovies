import { useEffect, useMemo, useState } from 'react';
import {
  getTrendingMovies,  getUpcomingMovies,
  getMovies,
  getCollections,
  getCollectionWithItems
} from '../services/supabase';
import CarouselRow from '../components/CarouselRow';
import HeroBanner from '../components/HeroBanner';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <HeroBanner />

      <div className="max-w-7xl mx-auto pt-10">
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
  );
};

export default Home;

