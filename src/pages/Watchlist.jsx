import { useMemo, useState } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';
import PosterCard from '../components/PosterCard';
import MusicCard from '../components/MusicCard';
import { SkeletonRow } from '../components/SkeletonLoader';

const Watchlist = () => {
  const { watchlist, loading, removeItem } = useWatchlist();
  const [activeTab, setActiveTab] = useState('movies');

  const movies = useMemo(() => watchlist.filter((item) => item.movie).map((item) => item.movie), [watchlist]);
  const music = useMemo(() => watchlist.filter((item) => item.music).map((item) => item.music), [watchlist]);
  
  const items = activeTab === 'movies' ? movies : music;

  if (loading) {
    return (
      <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h1 className="text-3xl md:text-5xl font-semibold mb-8">My Watchlist</h1>
          <SkeletonRow count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12 page-fade">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sky-300 text-xs uppercase tracking-[0.3em]">Library</p>
            <h1 className="text-3xl md:text-5xl font-semibold mt-2">My Watchlist</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('movies')}
              className={`chip ${activeTab === 'movies' ? 'chip-active' : ''}`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab('music')}
              className={`chip ${activeTab === 'music' ? 'chip-active' : ''}`}
            >
              Music
            </button>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center text-gray-400 mt-12 glass-card rounded-2xl p-10">
            <p className="text-xl">Your watchlist is empty</p>
            <p className="mt-2">Start adding movies or music to your watchlist.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-400 mt-12 glass-card rounded-2xl p-10">
            <p className="text-xl">Nothing here yet</p>
            <p className="mt-2">Add more items to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => (
              <div key={item.id} className="space-y-2">
                {activeTab === 'movies' ? (
                  <PosterCard item={item} type={'movie'} />
                ) : (
                  <MusicCard item={item} />
                )}
                <button
                  onClick={() => removeItem(item.id, activeTab === 'movies' ? 'movie' : 'music')}
                  className="w-full text-xs text-gray-300 hover:text-white border border-white/10 rounded-full py-2 hover:bg-white/10 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
