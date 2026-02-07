import { useState } from 'react';
import { createMovie, uploadImage } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

const AddMovie = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    overview: '',
    release_date: '',
    runtime: '',
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

      const movieData = {
        ...formData,
        runtime: parseInt(formData.runtime),
        rating: parseFloat(formData.rating),
        genres: formData.genres.split(',').map(g => g.trim()),
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
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">Add Movie</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Overview</label>
            <textarea
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Release Date</label>
              <input
                type="date"
                value={formData.release_date}
                onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Runtime (min)</label>
              <input
                type="number"
                value={formData.runtime}
                onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
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
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Genres (comma separated)</label>
            <input
              type="text"
              value={formData.genres}
              onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
              placeholder="Action, Drama, Thriller"
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Trailer URL</label>
            <input
              type="url"
              value={formData.trailer_url}
              onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Poster Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPosterFile(e.target.files[0])}
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Backdrop Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBackdropFile(e.target.files[0])}
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.trending}
              onChange={(e) => setFormData({ ...formData, trending: e.target.checked })}
              className="w-4 h-4"
            />
            <label className="text-sm">Mark as Trending</label>
          </div>

          <button type="submit" className="w-full btn-primary py-3" disabled={loading}>
            {loading ? 'Creating...' : 'Create Movie'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMovie;
