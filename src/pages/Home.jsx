import { useEffect, useState } from 'react';
import {
  getTrendingMovies,
  getPlatforms,
  getCollections,
  getCollectionWithItems
} from '../services/supabase';
import CarouselRow from '../components/CarouselRow';
import PlatformRow from '../components/PlatformRow';
import HeroBanner from '../components/HeroBanner';

const Home = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [trending, cols, platformsRes] = await Promise.all([
      getTrendingMovies(),
      getCollections(),
      getPlatforms({ activeOnly: true })
    ]);

    setTrendingMovies(trending.data || []);
    setPlatforms(platformsRes.data || []);

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

  const preferredTabs = ['Netflix', 'Prime', 'Max', 'Disney+', 'Apple TV', 'Paramount'];
  const platformTabs = preferredTabs
    .map((name) => platforms.find((p) => p.name?.toLowerCase().includes(name.toLowerCase())))
    .filter(Boolean);
  const findPlatform = (keyword) => platforms.find((p) => p.name?.toLowerCase().includes(keyword.toLowerCase()));
  const disneyPlatform = findPlatform('disney');
  const netflixPlatform = findPlatform('netflix');
  const primePlatform = findPlatform('prime');

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <HeroBanner />

      <div className="max-w-7xl mx-auto pt-4">
        <CarouselRow title="Trending" items={trendingMovies} type="movie" loading={loading} />

        {disneyPlatform && (
          <PlatformRow
            platformId={disneyPlatform.id}
            platformName={disneyPlatform.name}
            type="series"
            limit={12}
            tabs={platformTabs}
          />
        )}

        {netflixPlatform && (
          <PlatformRow
            platformId={netflixPlatform.id}
            platformName={netflixPlatform.name}
            type="movie"
            limit={12}
            tabs={platformTabs}
          />
        )}

        {primePlatform && (
          <PlatformRow
            platformId={primePlatform.id}
            platformName={primePlatform.name}
            type="both"
            limit={12}
            tabs={platformTabs}
          />
        )}

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
