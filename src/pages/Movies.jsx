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
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12 page-fade">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Movies</h1>
        </div>

        {/* Mobile Filter Chips */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
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

        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="glass-card rounded-2xl p-6 sticky top-28">
              <h3 className="font-semibold mb-4">Filters</h3>
              <div>
                <label className="text-sm font-medium mb-2 block">Genre</label>
                <div className="space-y-2">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => handleGenreClick(genre)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        selectedGenre === genre
                          ? 'bg-sky-500/20 text-sky-300 font-medium'
                          : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Poster Grid */}
          <div className="flex-1">
            {loading && page === 0 ? (
              <SkeletonGrid count={12} />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map((movie) => (
                    <PosterCard key={movie.id} item={movie} type="movie" />
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
      </div>
    </div>
  );
};

export default Movies;
