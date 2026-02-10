import { useState } from 'react';
import { createMusic } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const AddMusic = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({ cover: '', artwork: '' });
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    duration_seconds: '',
    release_year: '',
    cover_image_url: '',
    artwork_url: '',
    spotify_url: '',
    apple_music_url: '',
    youtube_music_url: '',
    amazon_music_url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isValidImageUrl = (value) => {
        if (!value) return true;
        if (!value.startsWith('https://')) return false;
        return /\.(jpg|png|webp|svg)(\?.*)?$/i.test(value);
      };

      if (!isValidImageUrl(formData.cover_image_url) || !isValidImageUrl(formData.artwork_url)) {
        alert('Please enter valid HTTPS image URLs.');
        setLoading(false);
        return;
      }

      const musicData = {
        title: formData.title,
        artist: formData.artist || null,
        album: formData.album || null,
        duration_seconds: formData.duration_seconds ? parseInt(formData.duration_seconds, 10) : null,
        release_year: formData.release_year ? parseInt(formData.release_year, 10) : null,
        cover_image_url: formData.cover_image_url || null,
        artwork_url: formData.artwork_url || null,
        spotify_url: formData.spotify_url || null,
        apple_music_url: formData.apple_music_url || null,
        youtube_music_url: formData.youtube_music_url || null,
        amazon_music_url: formData.amazon_music_url || null
      };

      await createMusic(musicData);
      navigate('/admin');
    } catch (err) {
      alert('Failed to create music item');
    }

    setLoading(false);
  };

  return (
    <AdminLayout title="Add Music" subtitle="Create a new music entry.">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Artist</label>
            <input
              type="text"
              value={formData.artist}
              onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Album</label>
            <input
              type="text"
              value={formData.album}
              onChange={(e) => setFormData({ ...formData, album: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
            <input
              type="number"
              value={formData.duration_seconds}
              onChange={(e) => setFormData({ ...formData, duration_seconds: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Release Year</label>
            <input
              type="number"
              value={formData.release_year}
              onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Album Cover Image URL (HTTPS)</label>
            <input
              type="url"
              value={formData.cover_image_url}
              onChange={(e) => {
                const value = e.target.value.trim();
                setFormData({ ...formData, cover_image_url: value });
                setImageErrors((prev) => ({
                  ...prev,
                  cover: value && (!value.startsWith('https://') || !/\.(jpg|png|webp|svg)(\?.*)?$/i.test(value))
                    ? 'Invalid Image URL'
                    : ''
                }));
              }}
              placeholder="https://image-link.jpg"
              className="w-full px-4 py-3 glass-input"
            />
            {imageErrors.cover && <p className="text-xs text-red-400 mt-2">{imageErrors.cover}</p>}
            {!imageErrors.cover && formData.cover_image_url && (
              <img
                src={formData.cover_image_url}
                alt="Cover preview"
                className="mt-3 w-32 h-32 rounded-xl object-cover border border-white/10"
                loading="lazy"
                onError={() => setImageErrors((prev) => ({ ...prev, cover: 'Invalid Image URL' }))}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Track Artwork URL (HTTPS)</label>
            <input
              type="url"
              value={formData.artwork_url}
              onChange={(e) => {
                const value = e.target.value.trim();
                setFormData({ ...formData, artwork_url: value });
                setImageErrors((prev) => ({
                  ...prev,
                  artwork: value && (!value.startsWith('https://') || !/\.(jpg|png|webp|svg)(\?.*)?$/i.test(value))
                    ? 'Invalid Image URL'
                    : ''
                }));
              }}
              placeholder="https://image-link.jpg"
              className="w-full px-4 py-3 glass-input"
            />
            {imageErrors.artwork && <p className="text-xs text-red-400 mt-2">{imageErrors.artwork}</p>}
            {!imageErrors.artwork && formData.artwork_url && (
              <img
                src={formData.artwork_url}
                alt="Artwork preview"
                className="mt-3 w-32 h-32 rounded-xl object-cover border border-white/10"
                loading="lazy"
                onError={() => setImageErrors((prev) => ({ ...prev, artwork: 'Invalid Image URL' }))}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Spotify URL</label>
            <input
              type="url"
              value={formData.spotify_url}
              onChange={(e) => setFormData({ ...formData, spotify_url: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Apple Music URL</label>
            <input
              type="url"
              value={formData.apple_music_url}
              onChange={(e) => setFormData({ ...formData, apple_music_url: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">YouTube Music URL</label>
            <input
              type="url"
              value={formData.youtube_music_url}
              onChange={(e) => setFormData({ ...formData, youtube_music_url: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Amazon Music URL</label>
            <input
              type="url"
              value={formData.amazon_music_url}
              onChange={(e) => setFormData({ ...formData, amazon_music_url: e.target.value })}
              className="w-full px-4 py-3 glass-input"
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Music'}
        </button>
      </form>
    </AdminLayout>
  );
};

export default AddMusic;
