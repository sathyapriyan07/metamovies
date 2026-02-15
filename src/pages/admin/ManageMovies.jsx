import { useEffect, useState, useCallback } from 'react';
import { getMovies, deleteMovie, getStudios, getStudiosByMovie, setMovieStudios, updateMovie } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import Toast from '../../components/Toast';

const ManageMovies = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [editingMovie, setEditingMovie] = useState(null);
  const [backdropUrl, setBackdropUrl] = useState('');
  const [backdropError, setBackdropError] = useState('');
  const [savingBackdrop, setSavingBackdrop] = useState(false);
  
  const [editingRatings, setEditingRatings] = useState(null);
  const [imdbRating, setImdbRating] = useState('');
  const [rottenRating, setRottenRating] = useState('');
  const [ratingError, setRatingError] = useState('');
  const [savingRatings, setSavingRatings] = useState(false);
  
  const [editingBooking, setEditingBooking] = useState(null);
  const [bookingUrl, setBookingUrl] = useState('');
  const [bookingLabel, setBookingLabel] = useState('');
  const [isNowShowing, setIsNowShowing] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [savingBooking, setSavingBooking] = useState(false);

  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerEnabled, setPlayerEnabled] = useState(false);
  const [playerUrlOverride, setPlayerUrlOverride] = useState('');
  const [playerError, setPlayerError] = useState('');
  const [savingPlayer, setSavingPlayer] = useState(false);

  const [allStudios, setAllStudios] = useState([]);
  const [editingStudiosMovie, setEditingStudiosMovie] = useState(null);
  const [selectedStudios, setSelectedStudios] = useState([]);
  const [studioSearch, setStudioSearch] = useState('');
  const [studioError, setStudioError] = useState('');
  const [savingStudios, setSavingStudios] = useState(false);
  
  const [editingTitleLogo, setEditingTitleLogo] = useState(null);
  const [titleLogoUrl, setTitleLogoUrl] = useState('');
  const [useTextTitle, setUseTextTitle] = useState(false);
  const [titleLogoError, setTitleLogoError] = useState('');
  const [savingTitleLogo, setSavingTitleLogo] = useState(false);
  
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadMovies();
    loadStudios();
  }, []);

  const loadStudios = async () => {
    const { data } = await getStudios({ activeOnly: false });
    setAllStudios(data || []);
  };

  const loadMovies = async () => {
    try {
      setLoading(true);
      const { data, error } = await getMovies(null, 0);
      if (error) throw error;
      setMovies(data || []);
      setFilteredMovies(data || []);
    } catch (error) {
      console.error('Error loading movies:', error);
      showToast('Failed to load movies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Debounced search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter(movie => 
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMovies(filtered);
    }
  }, [movies]);

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const validateEmbedUrl = (url) => {
    if (!url) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  };

  const handleToggleTrending = async (movie) => {
    try {
      const { error } = await updateMovie(movie.id, { trending: !movie.trending });
      if (error) throw error;
      showToast(`${movie.title} ${!movie.trending ? 'marked as' : 'removed from'} trending`, 'success');
      loadMovies();
    } catch (error) {
      console.error('Error toggling trending:', error);
      showToast('Failed to update trending status', 'error');
    }
  };

  const handleDelete = (movie) => {
    setDeleteConfirm(movie);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      const { error } = await deleteMovie(deleteConfirm.id);
      if (error) throw error;
      showToast(`${deleteConfirm.title} deleted successfully`, 'success');
      setDeleteConfirm(null);
      loadMovies();
    } catch (error) {
      console.error('Error deleting movie:', error);
      showToast('Failed to delete movie', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditBackdrop = (movie) => {
    setEditingMovie(movie);
    setBackdropUrl(movie.backdrop_url || '');
    setBackdropError('');
  };

  const handleSaveBackdrop = async () => {
    if (!editingMovie) return;
    
    setBackdropError('');
    
    if (backdropUrl && !validateUrl(backdropUrl)) {
      setBackdropError('URL must start with https://');
      return;
    }

    try {
      setSavingBackdrop(true);
      const { error } = await updateMovie(editingMovie.id, { backdrop_url: backdropUrl || null });
      if (error) throw error;
      
      showToast('Backdrop updated successfully', 'success');
      setEditingMovie(null);
      setBackdropUrl('');
      loadMovies();
    } catch (error) {
      console.error('Error updating backdrop:', error);
      setBackdropError(error.message || 'Failed to update backdrop');
    } finally {
      setSavingBackdrop(false);
    }
  };

  const handleEditRatings = (movie) => {
    setEditingRatings(movie);
    setImdbRating(movie.imdb_rating ?? '');
    setRottenRating(movie.rotten_rating ?? '');
    setRatingError('');
  };

  const handleSaveRatings = async () => {
    if (!editingRatings) return;
    
    setRatingError('');
    
    const imdbValue = imdbRating === '' ? null : parseFloat(imdbRating);
    const rottenValue = rottenRating === '' ? null : parseInt(rottenRating, 10);

    if (imdbValue !== null && (Number.isNaN(imdbValue) || imdbValue < 0 || imdbValue > 10)) {
      setRatingError('IMDb rating must be between 0 and 10');
      return;
    }
    if (rottenValue !== null && (Number.isNaN(rottenValue) || rottenValue < 0 || rottenValue > 100)) {
      setRatingError('Rotten Tomatoes rating must be between 0 and 100');
      return;
    }

    try {
      setSavingRatings(true);
      const { error } = await updateMovie(editingRatings.id, {
        imdb_rating: imdbValue,
        rotten_rating: rottenValue
      });
      if (error) throw error;

      showToast('Ratings updated successfully', 'success');
      setEditingRatings(null);
      setImdbRating('');
      setRottenRating('');
      loadMovies();
    } catch (error) {
      console.error('Error updating ratings:', error);
      setRatingError(error.message || 'Failed to update ratings');
    } finally {
      setSavingRatings(false);
    }
  };

  const handleEditBooking = (movie) => {
    setEditingBooking(movie);
    setIsNowShowing(!!movie.is_now_showing);
    setBookingUrl(movie.booking_url || '');
    setBookingLabel(movie.booking_label || '');
    setBookingError('');
  };

  const handleEditPlayer = (movie) => {
    setEditingPlayer(movie);
    setPlayerEnabled(!!movie.player_enabled);
    setPlayerUrlOverride(movie.player_url_override || '');
    setPlayerError('');
  };

  const handleEditStudios = async (movie) => {
    setEditingStudiosMovie(movie);
    setStudioSearch('');
    setStudioError('');
    const { data, error } = await getStudiosByMovie(movie.id);
    if (error) {
      setStudioError('Failed to load linked studios');
      setSelectedStudios([]);
      return;
    }
    setSelectedStudios((data || []).map((row) => row.studio_id).filter(Boolean));
  };

  const handleEditTitleLogo = (movie) => {
    setEditingTitleLogo(movie);
    setTitleLogoUrl(movie.title_logo_url || '');
    setUseTextTitle(!!movie.use_text_title);
    setTitleLogoError('');
  };

  const handleSaveTitleLogo = async () => {
    if (!editingTitleLogo) return;
    
    setTitleLogoError('');
    
    if (titleLogoUrl && !validateUrl(titleLogoUrl)) {
      setTitleLogoError('Logo URL must start with https://');
      return;
    }

    try {
      setSavingTitleLogo(true);
      const { error } = await updateMovie(editingTitleLogo.id, {
        title_logo_url: titleLogoUrl || null,
        use_text_title: useTextTitle
      });
      if (error) throw error;

      showToast('Title logo updated successfully', 'success');
      setEditingTitleLogo(null);
      setTitleLogoUrl('');
      setUseTextTitle(false);
      loadMovies();
    } catch (error) {
      console.error('Error updating title logo:', error);
      setTitleLogoError(error.message || 'Failed to update title logo');
    } finally {
      setSavingTitleLogo(false);
    }
  };

  const handleSaveBooking = async () => {
    if (!editingBooking) return;
    
    setBookingError('');
    
    if (isNowShowing && bookingUrl && !validateUrl(bookingUrl)) {
      setBookingError('Booking URL must start with https://');
      return;
    }

    const cleanedBookingLabel = (bookingLabel || '').replace(/[\r\n]+/g, ' ').trim();

    try {
      setSavingBooking(true);
      const { error } = await updateMovie(editingBooking.id, {
        is_now_showing: !!isNowShowing,
        booking_url: isNowShowing ? (bookingUrl || null) : null,
        booking_label: isNowShowing ? (cleanedBookingLabel || 'Book Tickets') : null,
        booking_last_updated: isNowShowing && bookingUrl ? new Date().toISOString() : null
      });
      if (error) throw error;

      showToast('Booking info updated successfully', 'success');
      setEditingBooking(null);
      setBookingUrl('');
      setBookingLabel('');
      setIsNowShowing(false);
      loadMovies();
    } catch (error) {
      console.error('Error updating booking:', error);
      setBookingError(error.message || 'Failed to update booking');
    } finally {
      setSavingBooking(false);
    }
  };

  const handleSavePlayer = async () => {
    if (!editingPlayer) return;
    setPlayerError('');

    if (playerUrlOverride && !validateEmbedUrl(playerUrlOverride)) {
      setPlayerError('Custom embed URL must be a valid http(s) URL.');
      return;
    }

    try {
      setSavingPlayer(true);
      const { error } = await updateMovie(editingPlayer.id, {
        player_enabled: !!playerEnabled,
        player_url_override: playerUrlOverride ? playerUrlOverride.trim() : null
      });
      if (error) throw error;

      showToast('Player settings updated successfully', 'success');
      setEditingPlayer(null);
      setPlayerEnabled(false);
      setPlayerUrlOverride('');
      loadMovies();
    } catch (error) {
      console.error('Error updating player settings:', error);
      setPlayerError(error.message || 'Failed to update player settings');
    } finally {
      setSavingPlayer(false);
    }
  };

  const toggleStudio = (studioId) => {
    setSelectedStudios((prev) => (
      prev.includes(studioId) ? prev.filter((id) => id !== studioId) : [...prev, studioId]
    ));
  };

  const handleSaveStudios = async () => {
    if (!editingStudiosMovie) return;
    setStudioError('');
    try {
      setSavingStudios(true);
      const { error } = await setMovieStudios(editingStudiosMovie.id, selectedStudios);
      if (error) throw error;
      showToast('Studios updated successfully', 'success');
      setEditingStudiosMovie(null);
      setSelectedStudios([]);
      setStudioSearch('');
    } catch (error) {
      console.error('Error updating movie studios:', error);
      setStudioError(error.message || 'Failed to update studios');
    } finally {
      setSavingStudios(false);
    }
  };

  const filteredStudios = allStudios.filter((studio) =>
    studio.name.toLowerCase().includes(studioSearch.toLowerCase())
  );

  return (
    <AdminLayout title="Manage Movies" subtitle="Edit or remove existing movies.">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="glass-card rounded-2xl p-4 md:p-6 pb-24 md:pb-12">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-2.5 glass-input text-sm"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-400">Loading movies...</p>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? 'No movies found matching your search' : 'No movies available'}
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredMovies.map((movie) => (
              <div key={movie.id} className="glass-card rounded-2xl border border-white/10 backdrop-blur-md hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-250">
                <div className="flex gap-3 items-center p-4">
                  <img
                    src={movie.poster_url || 'https://via.placeholder.com/100x150'}
                    alt={movie.title}
                    className="w-14 h-20 object-cover rounded-md shadow-md flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold truncate">{movie.title}</h3>
                    <p className="text-xs text-gray-400">{movie.release_date?.split('-')[0]}</p>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{movie.overview}</p>
                  </div>
                </div>

                <div className="px-4 pb-4 grid grid-cols-3 md:flex md:flex-wrap gap-2">
                  <button
                    onClick={() => handleEditTitleLogo(movie)}
                    className="px-3 py-2 bg-indigo-600/70 hover:bg-indigo-600 hover:scale-105 rounded-lg text-xs font-medium shadow-md transition-all duration-200"
                  >
                    Title Logo
                  </button>
                  <button
                    onClick={() => handleEditBackdrop(movie)}
                    className="px-3 py-2 bg-blue-600/70 hover:bg-blue-600 hover:scale-105 rounded-lg text-xs font-medium shadow-md transition-all duration-200"
                  >
                    Backdrop
                  </button>
                  <button
                    onClick={() => handleEditRatings(movie)}
                    className="px-3 py-2 bg-cyan-600/70 hover:bg-cyan-600 hover:scale-105 rounded-lg text-xs font-medium shadow-md transition-all duration-200"
                  >
                    Ratings
                  </button>
                  <button
                    onClick={() => handleEditBooking(movie)}
                    className="px-3 py-2 bg-purple-600/70 hover:bg-purple-600 hover:scale-105 rounded-lg text-xs font-medium shadow-md transition-all duration-200"
                  >
                    Booking
                  </button>
                  <button
                    onClick={() => handleEditStudios(movie)}
                    className="px-3 py-2 bg-amber-600/70 hover:bg-amber-600 hover:scale-105 rounded-lg text-xs font-medium shadow-md transition-all duration-200"
                  >
                    Studios
                  </button>
                  <button
                    onClick={() => handleEditPlayer(movie)}
                    className="px-3 py-2 bg-violet-600/70 hover:bg-violet-600 hover:scale-105 rounded-lg text-xs font-medium shadow-md transition-all duration-200"
                  >
                    Player
                  </button>
                  <button
                    onClick={() => handleToggleTrending(movie)}
                    className={`px-3 py-2 hover:scale-105 rounded-lg text-xs font-medium shadow-md transition-all duration-200 ${movie.trending ? 'bg-green-600/70 hover:bg-green-600' : 'bg-gray-600/60 hover:bg-gray-600'}`}
                  >
                    {movie.trending ? '⭐ Trending' : 'Trending'}
                  </button>
                  <button
                    onClick={() => handleDelete(movie)}
                    className="px-3 py-2 bg-red-600/80 hover:bg-red-600 hover:scale-105 rounded-lg text-xs font-medium shadow-md transition-all duration-200 col-span-2 md:col-span-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Title Logo Modal */}
        {editingTitleLogo && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-dark p-6 rounded-xl max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Title Logo - {editingTitleLogo.title}</h2>
              
              {titleLogoUrl && (
                <div className="mb-4 p-4 glass-card rounded-lg">
                  <p className="text-xs text-gray-400 mb-2">Preview:</p>
                  <img
                    src={titleLogoUrl}
                    alt="Logo Preview"
                    className="max-h-24 object-contain mx-auto drop-shadow-[0_0_20px_rgba(59,167,255,0.35)]"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300x100?text=Invalid+Logo'}
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title Logo URL</label>
                  <input
                    type="text"
                    placeholder="https://image.tmdb.org/t/p/original/logo.png"
                    value={titleLogoUrl}
                    onChange={(e) => {
                      setTitleLogoUrl(e.target.value);
                      setTitleLogoError('');
                    }}
                    className="w-full px-4 py-3 glass-input"
                  />
                  <p className="text-xs text-gray-400 mt-1">Recommended: PNG/SVG with transparent background, landscape orientation</p>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={useTextTitle}
                    onChange={(e) => setUseTextTitle(e.target.checked)}
                    className="w-4 h-4"
                  />
                  Force use text title instead of logo
                </label>
              </div>

              {titleLogoError && <p className="text-red-400 text-sm mt-2">{titleLogoError}</p>}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveTitleLogo}
                  disabled={savingTitleLogo}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingTitleLogo ? 'Saving...' : 'Save Logo'}
                </button>
                <button
                  onClick={() => {
                    setEditingTitleLogo(null);
                    setTitleLogoUrl('');
                    setUseTextTitle(false);
                    setTitleLogoError('');
                  }}
                  disabled={savingTitleLogo}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
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
                placeholder="https://image.tmdb.org/t/p/original/..."
                value={backdropUrl}
                onChange={(e) => {
                  setBackdropUrl(e.target.value);
                  setBackdropError('');
                }}
                className="w-full px-4 py-3 glass-input mb-2"
              />
              {backdropError && <p className="text-red-400 text-sm mb-4">{backdropError}</p>}

              <div className="flex gap-3">
                <button
                  onClick={handleSaveBackdrop}
                  disabled={savingBackdrop}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingBackdrop ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingMovie(null);
                    setBackdropUrl('');
                    setBackdropError('');
                  }}
                  disabled={savingBackdrop}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Ratings Modal */}
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
                    />
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={imdbRating}
                    onChange={(e) => {
                      setImdbRating(e.target.value);
                      setRatingError('');
                    }}
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
                    />
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={rottenRating}
                    onChange={(e) => {
                      setRottenRating(e.target.value);
                      setRatingError('');
                    }}
                    placeholder="0 - 100"
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
              </div>
              {ratingError && <p className="text-red-400 text-sm mt-2">{ratingError}</p>}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveRatings}
                  disabled={savingRatings}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingRatings ? 'Saving...' : 'Save Ratings'}
                </button>
                <button
                  onClick={() => {
                    setEditingRatings(null);
                    setRatingError('');
                  }}
                  disabled={savingRatings}
                  className="flex-1 btn-ghost disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Booking Modal */}
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
                      onChange={(e) => {
                        setBookingUrl(e.target.value);
                        setBookingError('');
                      }}
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
              {bookingError && <p className="text-red-400 text-sm mt-2">{bookingError}</p>}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveBooking}
                  disabled={savingBooking}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingBooking ? 'Saving...' : 'Save Booking'}
                </button>
                <button
                  onClick={() => {
                    setEditingBooking(null);
                    setBookingError('');
                  }}
                  disabled={savingBooking}
                  className="flex-1 btn-ghost disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Player Modal */}
        {editingPlayer && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-dark p-6 rounded-xl max-w-xl w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Player - {editingPlayer.title}</h2>
              <label className="flex items-center gap-2 text-sm font-medium mb-4">
                <input
                  type="checkbox"
                  checked={playerEnabled}
                  onChange={(e) => setPlayerEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                Enable Player
              </label>

              <div>
                <label className="block text-sm font-medium mb-2">Custom Embed URL (Optional)</label>
                <input
                  type="url"
                  value={playerUrlOverride}
                  onChange={(e) => {
                    setPlayerUrlOverride(e.target.value);
                    setPlayerError('');
                  }}
                  placeholder="https://example.com/embed/movie/12345"
                  className="w-full px-4 py-3 glass-input"
                />
                <p className="text-xs text-gray-400 mt-2">Leave empty to use default TMDB-based embed URL.</p>
              </div>

              {playerError && <p className="text-red-400 text-sm mt-2">{playerError}</p>}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSavePlayer}
                  disabled={savingPlayer}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPlayer ? 'Saving...' : 'Save Player'}
                </button>
                <button
                  onClick={() => {
                    setEditingPlayer(null);
                    setPlayerEnabled(false);
                    setPlayerUrlOverride('');
                    setPlayerError('');
                  }}
                  disabled={savingPlayer}
                  className="flex-1 btn-ghost disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Studios Modal */}
        {editingStudiosMovie && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-dark p-6 rounded-xl max-w-2xl w-full">
              <h2 className="text-2xl font-bold mb-4">Edit Studios - {editingStudiosMovie.title}</h2>
              <input
                type="text"
                value={studioSearch}
                onChange={(e) => setStudioSearch(e.target.value)}
                placeholder="Search studios..."
                className="w-full px-4 py-3 glass-input mb-3"
              />
              <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-2 space-y-1">
                {filteredStudios.map((studio) => (
                  <label key={studio.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudios.includes(studio.id)}
                      onChange={() => toggleStudio(studio.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm flex-1">{studio.name}</span>
                    <span className="text-[11px] uppercase text-gray-400">{studio.type}</span>
                  </label>
                ))}
              </div>
              {studioError && <p className="text-red-400 text-sm mt-2">{studioError}</p>}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveStudios}
                  disabled={savingStudios}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingStudios ? 'Saving...' : 'Save Studios'}
                </button>
                <button
                  onClick={() => {
                    setEditingStudiosMovie(null);
                    setSelectedStudios([]);
                    setStudioSearch('');
                    setStudioError('');
                  }}
                  disabled={savingStudios}
                  className="flex-1 btn-ghost disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-dark p-6 rounded-xl max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Delete Movie</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.title}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold disabled:opacity-50"
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
