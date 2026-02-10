import { useState } from 'react';
import { createMovie, uploadImage } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const AddMovie = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    release_date: '',
    runtime: '',
    rating: '',
    is_now_showing: false,
    booking_url: '',
    booking_label: '',
    imdb_rating: '',
    rotten_rating: '',
    genres: '',
    trailer_url: '',
    trending: false
  });
  const [posterFile, setPosterFile] = useState(null);
  const [backdropFile, setBackdropFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let posterUrl = null;
      let backdropUrl = null;

      if (posterFile) {
        const { data } = await uploadImage(posterFile, 'posters', `${Date.now()}_${posterFile.name}`);
        posterUrl = data;
      }

      if (backdropFile) {
        const { data } = await uploadImage(backdropFile, 'backdrops', `${Date.now()}_${backdropFile.name}`);
        backdropUrl = data;
      }

      if (formData.is_now_showing && formData.booking_url) {
        try {
          new URL(formData.booking_url);
        } catch {
          alert('Please enter a valid booking URL.');
          setLoading(false);
          return;
        }
      }

      const cleanedBookingLabel = (formData.booking_label || '').replace(/[\r\n]+/g, ' ').trim();

      const movieData = {
        ...formData,
        runtime: parseInt(formData.runtime),
        rating: parseFloat(formData.rating),
        is_now_showing: !!formData.is_now_showing,
        booking_url: formData.is_now_showing ? (formData.booking_url || null) : null,
        booking_label: formData.is_now_showing ? (cleanedBookingLabel || 'Book Tickets') : null,
        booking_last_updated: formData.is_now_showing && formData.booking_url ? new Date().toISOString() : null,
        imdb_rating: formData.imdb_rating ? parseFloat(formData.imdb_rating) : null,
        rotten_rating: formData.rotten_rating ? parseInt(formData.rotten_rating, 10) : null,
        genres: formData.genres.split(',').map((g) => g.trim()),
        poster_url: posterUrl,
        backdrop_url: backdropUrl
      };

      await createMovie(movieData);
      navigate('/admin');
    } catch (error) {
      alert('Failed to create movie');
    }

    setLoading(false);
  };

  return (
    <AdminLayout title="Add Movie" subtitle="Create a new movie entry.">
      <form onSubmit={handleSubmit} className="space-y-6 glass-card rounded-2xl p-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="w-full px-4 py-3 glass-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Overview</label>
          <textarea
            value={formData.overview}
            onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 glass-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Release Date</label>
            <input
              type="date"
              value={formData.release_date}
              onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Runtime (min)</label>
            <input
              type="number"
              value={formData.runtime}
              onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <input
            type="number"
            step="0.1"
            max="10"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            className="w-full px-4 py-3 glass-input"
          />
        </div>

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
              value={formData.imdb_rating}
              onChange={(e) => setFormData({ ...formData, imdb_rating: e.target.value })}
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
              value={formData.rotten_rating}
              onChange={(e) => setFormData({ ...formData, rotten_rating: e.target.value })}
              placeholder="0 - 100"
              className="w-full px-4 py-3 glass-input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Genres (comma separated)</label>
          <input
            type="text"
            value={formData.genres}
            onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
            placeholder="Action, Drama, Thriller"
            className="w-full px-4 py-3 glass-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Trailer URL</label>
          <input
            type="url"
            value={formData.trailer_url}
            onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
            className="w-full px-4 py-3 glass-input"
          />
        </div>

        <div className="glass-card/0">
          <label className="flex items-center gap-2 text-sm font-medium mb-3">
            <input
              type="checkbox"
              checked={formData.is_now_showing}
              onChange={(e) => setFormData({ ...formData, is_now_showing: e.target.checked })}
              className="w-4 h-4"
            />
            Currently Streaming / In Theatres
          </label>

          {formData.is_now_showing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Booking URL</label>
                <input
                  type="url"
                  value={formData.booking_url}
                  onChange={(e) => setFormData({ ...formData, booking_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Button Label (optional)</label>
                <input
                  type="text"
                  value={formData.booking_label}
                  onChange={(e) => setFormData({ ...formData, booking_label: e.target.value })}
                  placeholder="Book Tickets"
                  className="w-full px-4 py-3 glass-input"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Poster Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPosterFile(e.target.files[0])}
            className="w-full px-4 py-3 glass-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Backdrop Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setBackdropFile(e.target.files[0])}
            className="w-full px-4 py-3 glass-input"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={formData.trending}
            onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
            className="w-4 h-4"
          />
          Mark as Trending
        </label>

        <button type="submit" className="w-full btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Movie'}
        </button>
      </form>
    </AdminLayout>
  );
};

export default AddMovie;
