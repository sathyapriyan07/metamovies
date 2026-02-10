import { useState } from 'react';
import { createSeries, uploadImage } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const AddSeries = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    first_air_date: '',
    rating: '',
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

      const seriesData = {
        ...formData,
        rating: parseFloat(formData.rating),
        genres: formData.genres.split(',').map((g) => g.trim()),
        poster_url: posterUrl,
        backdrop_url: backdropUrl
      };

      await createSeries(seriesData);
      navigate('/admin');
    } catch (error) {
      alert('Failed to create series');
    }

    setLoading(false);
  };

  return (
    <AdminLayout title="Add Series" subtitle="Create a new series entry.">
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

        <div>
          <label className="block text-sm font-medium mb-2">First Air Date</label>
          <input
            type="date"
            value={formData.first_air_date}
            onChange={(e) => setFormData({ ...formData, first_air_date: e.target.value })}
            className="w-full px-4 py-3 glass-input"
          />
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
          {loading ? 'Creating...' : 'Create Series'}
        </button>
      </form>
    </AdminLayout>
  );
};

export default AddSeries;
