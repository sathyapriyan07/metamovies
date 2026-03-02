import { useEffect, useState } from 'react';
import { getSeries } from '../services/supabase';
import PosterCard from '../components/PosterCard';

const Series = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSeries(true);
  }, []);

  useEffect(() => {
    if (page > 0) loadSeries();
  }, [page]);

  const loadSeries = async (reset = false) => {
    setLoading(true);
    const { data } = await getSeries(20, reset ? 0 : page * 20);
    if (data) {
      setItems((prev) => (reset ? data : [...prev, ...data]));
      setHasMore(data.length === 20);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Header */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-white">TV Series</h1>
          
          {/* Search Input */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search series..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 transition"
          />
        </div>

        {/* Content */}
        {loading && page === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-400 text-sm">Loading...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items
                .filter((s) => s.name?.toLowerCase().includes(search.toLowerCase()))
                .map((item) => (
                  <PosterCard key={item.id} item={item} type="series" />
                ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl w-full sm:w-auto hover:bg-yellow-400 transition"
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
