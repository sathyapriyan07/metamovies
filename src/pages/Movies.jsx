import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMovies } from '../services/supabase';
import PosterCard from '../components/PosterCard';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'All');
  const [search, setSearch] = useState('');

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
    <div className="min-h-screen bg-black overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Page Header */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-white">Movies</h1>
          
          {/* Filters */}
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search movies..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 transition"
            />
            <select
              value={selectedGenre}
              onChange={(e) => handleGenreClick(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 transition"
            >
              {genres.map((genre) => (
                <option key={genre} value={genre} className="bg-zinc-900">
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading && page === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-400 text-sm">Loading...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies
                .filter((m) => m.title?.toLowerCase().includes(search.toLowerCase()))
                .map((movie) => (
                  <PosterCard key={movie.id} item={movie} type="movie" />
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

export default Movies;
