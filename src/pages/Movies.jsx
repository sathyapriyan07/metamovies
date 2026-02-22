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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <h1 className="text-lg font-semibold">Movies</h1>
        <div className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movies"
            className="w-full bg-[#1a1a1a] rounded-md px-3 py-2 text-sm text-white placeholder:text-gray-500"
          />
          <select
            value={selectedGenre}
            onChange={(e) => handleGenreClick(e.target.value)}
            className="w-full bg-[#1a1a1a] rounded-md px-3 py-2 text-sm text-white"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre} className="bg-[#0f0f0f]">
                {genre}
              </option>
            ))}
          </select>
        </div>

        {loading && page === 0 ? (
          <p className="mt-4">Loading...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {movies
                .filter((m) => m.title?.toLowerCase().includes(search.toLowerCase()))
                .map((movie) => (
                  <PosterCard key={movie.id} item={movie} type="movie" />
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

export default Movies;
