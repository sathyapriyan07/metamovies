import { useEffect, useState } from 'react';
import {
  getTrendingMovies,
  getCollections,
  getCollectionWithItems
} from '../services/supabase';
import CarouselRow from '../components/CarouselRow';
import PosterCard from '../components/PosterCard';
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
    <div className="min-h-screen pb-[88px] md:pb-12">
      <HeroBanner />

      <main className="home-desktop-wrapper pt-6 lg:pt-10">
        <div className="lg:hidden">
          <CarouselRow title="Trending Now" items={trendingMovies} type="movie" loading={loading} padded={false} />
        </div>
        <div className="hidden lg:block section-block">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-6">Trending Now</h2>
          <div className="desktop-poster-grid">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={`t-${i}`} className="aspect-[2/3] rounded-2xl bg-white/10 animate-pulse" />
                ))
              : trendingMovies.map((movie) => (
                  <div key={movie.id}>
                    <PosterCard item={movie} type="movie" />
                  </div>
                ))}
          </div>
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




