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
    <div>
      <h1>Movies</h1>
      <div className="tab-container" style={{ marginTop: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className={`tab ${selectedGenre === genre ? 'active' : ''}`}
          >
            {genre}
          </button>
        ))}
      </div>

      {loading && page === 0 ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <PosterCard key={movie.id} item={movie} type="movie" />
            ))}
          </div>
          {hasMore && (
            <div style={{ marginTop: 16 }}>
              <button onClick={() => setPage((p) => p + 1)} className="button-primary" disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Movies;
