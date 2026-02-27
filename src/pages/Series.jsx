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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <h1 className="text-lg font-semibold">Series</h1>
        <div className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search series"
            className="w-full bg-[#1a1a1a] rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500"
          />
        </div>

        {loading && page === 0 ? (
          <p className="mt-4">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {items
                .filter((s) => s.name?.toLowerCase().includes(search.toLowerCase()))
                .map((item) => (
                  <PosterCard key={item.id} item={item} type="series" />
                ))}
            </div>
            {hasMore && (
              <div className="mt-6">
                <button onClick={() => setPage((p) => p + 1)} className="w-full btn-primary" disabled={loading}>
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
