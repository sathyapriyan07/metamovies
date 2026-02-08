import { useEffect, useState } from 'react';
import { getMovies } from '../services/supabase';
import PosterCard from '../components/PosterCard';
import { SkeletonRow } from '../components/SkeletonCard';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadMovies();
  }, [page]);

  const loadMovies = async () => {
    setLoading(true);
    const { data } = await getMovies(20, page * 20);
    if (data) {
      setMovies(prev => page === 0 ? data : [...prev, ...data]);
      setHasMore(data.length === 20);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Movies</h1>
        
        {loading && page === 0 ? (
          <SkeletonRow count={10} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {movies.map((movie) => (
                <PosterCard key={movie.id} item={movie} type="movie" />
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

export default Movies;
