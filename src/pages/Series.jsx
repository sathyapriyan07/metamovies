import { useEffect, useState } from 'react';
import { getSeries } from '../services/supabase';
import PosterCard from '../components/PosterCard';
import { SkeletonRow } from '../components/SkeletonCard';

const Series = () => {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadSeries();
  }, [page]);

  const loadSeries = async () => {
    setLoading(true);
    const { data } = await getSeries(20, page * 20);
    if (data) {
      setSeries(prev => page === 0 ? data : [...prev, ...data]);
      setHasMore(data.length === 20);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">TV Series</h1>
        
        {loading && page === 0 ? (
          <SkeletonRow count={10} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {series.map((item) => (
                <PosterCard key={item.id} item={item} type="series" />
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Series;
