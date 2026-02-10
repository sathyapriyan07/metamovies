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
  const [editingRatings, setEditingRatings] = useState(null);
  const [imdbRating, setImdbRating] = useState('');
  const [rottenRating, setRottenRating] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingUrl, setBookingUrl] = useState('');
  const [bookingLabel, setBookingLabel] = useState('');
  const [isNowShowing, setIsNowShowing] = useState(false);

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

  const handleEditRatings = (movie) => {
    setEditingRatings(movie);
    setImdbRating(movie.imdb_rating ?? '');
    setRottenRating(movie.rotten_rating ?? '');
  };

  const handleSaveRatings = async () => {
    if (!editingRatings) return;
    const imdbValue = imdbRating === '' ? null : parseFloat(imdbRating);
    const rottenValue = rottenRating === '' ? null : parseInt(rottenRating, 10);

    if (imdbValue !== null && (Number.isNaN(imdbValue) || imdbValue > 10)) {
      alert('IMDb rating must be between 0 and 10.');
      return;
    }
    if (rottenValue !== null && (Number.isNaN(rottenValue) || rottenValue > 100)) {
      alert('Rotten Tomatoes rating must be between 0 and 100.');
      return;
    }

    const { error } = await updateMovie(editingRatings.id, {
      imdb_rating: imdbValue,
      rotten_rating: rottenValue
    });

    if (error) {
      alert(`Failed to update ratings: ${error.message}`);
      return;
    }

    setEditingRatings(null);
    setImdbRating('');
    setRottenRating('');
    loadMovies();
  };
  const handleEditBooking = (movie) => {
    setEditingBooking(movie);
    setIsNowShowing(!!movie.is_now_showing);
    setBookingUrl(movie.booking_url || '');
    setBookingLabel(movie.booking_label || '');
  };

  const handleSaveBooking = async () => {
    if (!editingBooking) return;
    if (isNowShowing && bookingUrl) {
      try {
        new URL(bookingUrl);
      } catch {
        alert('Please enter a valid booking URL.');
        return;
      }
    }

    const cleanedBookingLabel = (bookingLabel || '').replace(/[\r\n]+/g, ' ').trim();

    const { error } = await updateMovie(editingBooking.id, {
      is_now_showing: !!isNowShowing,
      booking_url: isNowShowing ? (bookingUrl || null) : null,
      booking_label: isNowShowing ? (cleanedBookingLabel || 'Book Tickets') : null,
      booking_last_updated: isNowShowing && bookingUrl ? new Date().toISOString() : null
    });

    if (error) {
      alert(`Failed to update booking: ${error.message}`);
      return;
    }

    setEditingBooking(null);
    setBookingUrl('');
    setBookingLabel('');
    setIsNowShowing(false);
    loadMovies();
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
                    onClick={() => handleEditRatings(movie)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm"
                  >
                    Edit Ratings
                  </button>
                  <button
                    onClick={() => handleEditBooking(movie)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm"
                  >
                    Edit Booking
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

        {editingRatings && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-dark p-6 rounded-xl max-w-xl w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Ratings - {editingRatings.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <span>IMDb Rating</span>
                    <img
                      src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='16' viewBox='0 0 24 16'><rect width='24' height='16' rx='3' fill='%23f5c518'/><text x='12' y='11' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='9' font-weight='700' fill='%23000000'>IMDb</text></svg>"
                      alt="IMDb"
                      className="w-6 h-4"
                      loading="lazy"
                      decoding="async"
                    />
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    max="10"
                    value={imdbRating}
                    onChange={(e) => setImdbRating(e.target.value)}
                    placeholder="0 - 10"
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <span>Rotten Tomatoes</span>
                    <img
                      src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'><path fill='%23e50914' d='M12 2c3 2.5 6 5.5 6 9a6 6 0 1 1-12 0c0-3.5 3-6.5 6-9z'/><circle cx='9' cy='11' r='1.2' fill='%23ffffff'/><circle cx='15' cy='11' r='1.2' fill='%23ffffff'/></svg>"
                      alt="Rotten Tomatoes"
                      className="w-4 h-4"
                      loading="lazy"
                      decoding="async"
                    />
                  </label>
                  <input
                    type="number"
                    max="100"
                    value={rottenRating}
                    onChange={(e) => setRottenRating(e.target.value)}
                    placeholder="0 - 100"
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSaveRatings} className="flex-1 btn-primary">
                  Save Ratings
                </button>
                <button onClick={() => setEditingRatings(null)} className="flex-1 btn-ghost">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {editingBooking && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-dark p-6 rounded-xl max-w-xl w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Booking - {editingBooking.title}</h2>
              <label className="flex items-center gap-2 text-sm font-medium mb-4">
                <input
                  type="checkbox"
                  checked={isNowShowing}
                  onChange={(e) => setIsNowShowing(e.target.checked)}
                  className="w-4 h-4"
                />
                Currently Streaming / In Theatres
              </label>

              {isNowShowing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Booking URL</label>
                    <input
                      type="url"
                      value={bookingUrl}
                      onChange={(e) => setBookingUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-4 py-3 glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Button Label (optional)</label>
                    <input
                      type="text"
                      value={bookingLabel}
                      onChange={(e) => setBookingLabel(e.target.value)}
                      placeholder="Book Tickets"
                      className="w-full px-4 py-3 glass-input"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={handleSaveBooking} className="flex-1 btn-primary">
                  Save Booking
                </button>
                <button onClick={() => setEditingBooking(null)} className="flex-1 btn-ghost">
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
