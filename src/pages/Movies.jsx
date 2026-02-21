import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMovies } from '../services/supabase';
import PosterCard from '../components/PosterCard';
import { SkeletonGrid } from '../components/SkeletonLoader';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'All');

  const genres = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi', 'Fantasy', 'Animation'];

  useEffect(() => {
    setPage(0);
    loadMovies(true);
  }, [selectedGenre]);

  useEffect(() => {
    if (page > 0) loadMovies();
  }, [page]);

  const loadMovies = async (reset = false) => {
    setLoading(true);
    const { data } = await getMovies(20, reset ? 0 : page * 20);
    if (data) {
      let filtered = data;
      if (selectedGenre !== 'All') {
        filtered = data.filter((m) => m.genres?.includes(selectedGenre));
      }
      setMovies((prev) => (reset ? filtered : [...prev, ...filtered]));
      setHasMore(data.length === 20);
    }
    setLoading(false);
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    if (genre === 'All') {
      searchParams.delete('genre');
    } else {
      searchParams.set('genre', genre);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 page-fade">
      <div className="container-desktop pt-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold">Movies</h1>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted">
            <span>Sort:</span>
            <span className="rounded-full border border-white/10 px-3 py-1 bg-white/5">Newest</span>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className={`chip ${selectedGenre === genre ? 'chip-active' : ''}`}
            >
              {genre}
            </button>
          ))}
        </div>

        {loading && page === 0 ? (
          <SkeletonGrid count={12} />
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4 lg:gap-5">
              {movies.map((movie) => (
                <PosterCard key={movie.id} item={movie} type="movie" compact />
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

export default Movies;




