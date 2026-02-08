import { useEffect, useState } from 'react';
import { getMovies, deleteMovie, updateMovie } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

const ManageMovies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setLoading(true);
    const { data } = await getMovies(null, 0);
    setMovies(data || []);
    setFilteredMovies(data || []);
    setLoading(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  };

  const handleToggleTrending = async (movie) => {
    await updateMovie(movie.id, { trending: !movie.trending });
    loadMovies();
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Delete "${title}"?`)) {
      await deleteMovie(id);
      loadMovies();
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Manage Movies</h1>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
          />
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="glass-dark p-4 rounded-xl flex gap-4">
                <img
                  src={movie.poster_url || 'https://via.placeholder.com/100x150'}
                  alt={movie.title}
                  className="w-16 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{movie.title}</h3>
                  <p className="text-sm text-gray-400">{movie.release_date?.split('-')[0]}</p>
                  <p className="text-sm text-gray-400 line-clamp-2">{movie.overview}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleTrending(movie)}
                    className={`px-4 py-2 rounded-lg ${movie.trending ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                  >
                    {movie.trending ? '⭐ Trending' : 'Set Trending'}
                  </button>
                  <button
                    onClick={() => handleDelete(movie.id, movie.title)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMovies;
