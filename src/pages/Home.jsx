import { useEffect, useState } from 'react';
import {
  getTrendingMovies,
  getCollections,
  getCollectionWithItems
} from '../services/supabase';
import CarouselRow from '../components/CarouselRow';
import PlatformStreamingSection from '../components/PlatformStreamingSection';
import HeroBanner from '../components/HeroBanner';
import TopHeader from '../components/TopHeader';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [trending, cols] = await Promise.all([
      getTrendingMovies(),
      getCollections()
    ]);

    setTrendingMovies(trending.data || []);

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
      <TopHeader />
      <HeroBanner />

      <div className="max-w-7xl mx-auto pt-4">
        <CarouselRow title="Trending" items={trendingMovies} type="movie" loading={loading} />

        <PlatformStreamingSection limit={12} />

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
