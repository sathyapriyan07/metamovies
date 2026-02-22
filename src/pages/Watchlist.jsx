import { useEffect, useState } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';

const Watchlist = () => {
  const { watchlist, loading, removeItem } = useWatchlist();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const movies = watchlist.filter((item) => item.movie).map((item) => item.movie);
    setItems(movies);
  }, [watchlist]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <h1 className="text-lg font-semibold">My Watchlist</h1>
        {watchlist.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Your watchlist is empty</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Nothing here yet</p>
        ) : (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Movies</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {items.map((item) => (
                <div key={item.id}>
                  <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[#1a1a1a] border border-gray-800">
                    {typeof item.rating === 'number' && (
                      <div className="absolute top-2 left-2 bg-[#F5C518] text-black text-xs font-semibold px-2 py-0.5 rounded">
                        {item.rating.toFixed(1)}
                      </div>
                    )}
                    <img
                      loading="lazy"
                      src={item.poster_url || item.backdrop_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium truncate">{item.title}</p>
                  <button onClick={() => removeItem(item.id, 'movie')} className="mt-2 text-xs text-gray-400 hover:text-white">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
