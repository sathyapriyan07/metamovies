import { useEffect, useState } from 'react';
import { getMusic } from '../services/supabase';
import MusicCard from '../components/MusicCard';
import { SkeletonRow } from '../components/SkeletonLoader';

const Music = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (page === 0) {
      loadMusic(true);
    } else {
      loadMusic();
    }
  }, [page]);

  const loadMusic = async (reset = false) => {
    setLoading(true);
    const { data } = await getMusic(20, reset ? 0 : page * 20);
    if (data) {
      setTracks((prev) => (reset ? data : [...prev, ...data]));
      setHasMore(data.length === 20);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12 page-fade">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <p className="text-emerald-300 text-xs uppercase tracking-[0.3em]">Listen</p>
          <h1 className="text-3xl md:text-5xl font-semibold mt-2">Music</h1>
        </div>

        {loading && page === 0 ? (
          <SkeletonRow count={10} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tracks.map((track) => (
                <MusicCard key={track.id} item={track} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
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

export default Music;
