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
import HomeSearchBar from '../components/HomeSearchBar';

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
    <div className="min-h-screen pb-[88px] md:pb-12 lg:overflow-x-hidden">
      <TopHeader />
      <HeroBanner />

      <main className="max-w-7xl lg:max-w-[1280px] mx-auto px-4 md:px-6 lg:px-10 pt-4 lg:pt-8">
        <div className="mt-4 lg:mt-0">
          <HomeSearchBar />
        </div>

        <div className="mt-6 lg:mt-12">
          <CarouselRow title="Trending" items={trendingMovies} type="movie" loading={loading} padded={false} />
        </div>

        <PlatformStreamingSection limit={12} />

        {collections.map((collection) => (
          <CarouselRow
            key={collection.id}
            title={collection.name}
            items={collection.items}
            type={collection.items[0]?.type || 'movie'}
            loading={loading}
            padded={false}
          />
        ))}
      </main>
    </div>
  );
};

export default Home;
