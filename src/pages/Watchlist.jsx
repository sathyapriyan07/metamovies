import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';

const Watchlist = () => {
  const navigate = useNavigate();
  const { watchlist, loading, removeItem } = useWatchlist();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const movies = watchlist.filter((item) => item.movie).map((item) => item.movie);
    setItems(movies);
  }, [watchlist]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black overflow-x-hidden">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-zinc-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Header */}
        <h1 className="text-2xl font-semibold text-white">My Watchlist</h1>

        {/* Content */}
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-zinc-400 text-sm">Your watchlist is empty</p>
            <button
              onClick={() => navigate('/movies')}
              className="bg-yellow-500 text-black font-semibold px-6 py-3 rounded-xl hover:bg-yellow-400 transition"
            >
              Browse Movies
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="text-zinc-400 text-sm">Nothing here yet</p>
        ) : (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Movies ({items.length})</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div
                    className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900 cursor-pointer group"
                    onClick={() => navigate(`/movie/${item.id}`)}
                  >
                    {typeof item.rating === 'number' && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-md z-10">
                        {item.rating.toFixed(1)}
                      </div>
                    )}
                    <img
                      loading="lazy"
                      src={item.poster_url || item.backdrop_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-white line-clamp-2 leading-tight">{item.title}</p>
                    <button
                      onClick={() => removeItem(item.id, 'movie')}
                      className="text-xs text-zinc-500 hover:text-red-500 transition"
                    >
                      Remove
                    </button>
                  </div>
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
