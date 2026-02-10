import { useEffect, useState } from 'react';
import { getMovies, deleteMovie, updateMovie } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const ManageMovies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMovie, setEditingMovie] = useState(null);
  const [backdropUrl, setBackdropUrl] = useState('');

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

  const handleEditBackdrop = (movie) => {
    setEditingMovie(movie);
    setBackdropUrl(movie.backdrop_url || '');
  };

  const handleSaveBackdrop = async () => {
    if (editingMovie) {
      await updateMovie(editingMovie.id, { backdrop_url: backdropUrl });
      setEditingMovie(null);
      setBackdropUrl('');
      loadMovies();
    }
  };

  return (
    <AdminLayout title="Manage Movies" subtitle="Edit or remove existing movies.">
      <div className="glass-card rounded-2xl p-6">

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
                    onClick={() => handleEditBackdrop(movie)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                  >
                    Edit Backdrop
                  </button>
                  <button
                    onClick={() => handleToggleTrending(movie)}
                    className={`px-4 py-2 rounded-lg text-sm ${movie.trending ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                  >
                    {movie.trending ? '⭐ Trending' : 'Set Trending'}
                  </button>
                  <button
                    onClick={() => handleDelete(movie.id, movie.title)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Backdrop Modal */}
        {editingMovie && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-dark p-6 rounded-xl max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Backdrop - {editingMovie.title}</h2>
              
              {backdropUrl && (
                <img
                  src={backdropUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg mb-4"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/800x450'}
                />
              )}

              <input
                type="text"
                placeholder="Backdrop URL"
                value={backdropUrl}
                onChange={(e) => setBackdropUrl(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={handleSaveBackdrop}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingMovie(null);
                    setBackdropUrl('');
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageMovies;
