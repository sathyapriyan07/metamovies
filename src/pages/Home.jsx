import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getTrendingMovies,
  getCollections,
  getCollectionWithItems
} from '../services/supabase';
import CarouselRow from '../components/CarouselRow';
import PlatformStreamingSection from '../components/PlatformStreamingSection';
import HeroBanner from '../components/HeroBanner';

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
      <div className="md:hidden relative z-30 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
        <Link to="/" className="inline-flex items-center gap-2">
          <img
            src="/favicon.png"
            alt="MetaMovies"
            loading="lazy"
            className="h-8 w-8 object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)]"
          />
          <span className="text-base font-semibold tracking-tight text-white">
            MetaMovies<span className="text-sky-400">+</span>
          </span>
        </Link>
      </div>
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
