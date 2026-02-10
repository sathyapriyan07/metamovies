import { useEffect, useState } from 'react';
import { getMusic, updateMusic, deleteMusic } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';
import MusicPlatforms from '../../components/MusicPlatforms';

const ManageMusic = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageError, setImageError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    album: '',
    duration_seconds: '',
    release_year: '',
    artwork_url: '',
    spotify_url: '',
    apple_music_url: '',
    youtube_music_url: '',
    amazon_music_url: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const { data } = await getMusic(null, 0);
    setItems(data || []);
    setFilteredItems(data || []);
    setSearchQuery('');
    setLoading(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setImageError('');
    setFormData({
      title: item.title || '',
      artist: item.artist || '',
      album: item.album || '',
      duration_seconds: item.duration_seconds || '',
      release_year: item.release_year || '',
      artwork_url: item.artwork_url || '',
      spotify_url: item.spotify_url || '',
      apple_music_url: item.apple_music_url || '',
      youtube_music_url: item.youtube_music_url || '',
      amazon_music_url: item.amazon_music_url || ''
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (formData.artwork_url && (!formData.artwork_url.startsWith('https://') || !/\.(jpg|png|webp|svg)(\?.*)?$/i.test(formData.artwork_url))) {
      alert('Please enter a valid HTTPS artwork URL.');
      return;
    }

    await updateMusic(selectedItem.id, {
      title: formData.title,
      artist: formData.artist || null,
      album: formData.album || null,
      duration_seconds: formData.duration_seconds ? parseInt(formData.duration_seconds, 10) : null,
      release_year: formData.release_year ? parseInt(formData.release_year, 10) : null,
      artwork_url: formData.artwork_url || null,
      spotify_url: formData.spotify_url || null,
      apple_music_url: formData.apple_music_url || null,
      youtube_music_url: formData.youtube_music_url || null,
      amazon_music_url: formData.amazon_music_url || null
    });

    await loadItems();
    setSelectedItem(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this music item?')) return;
    await deleteMusic(id);
    await loadItems();
    setSelectedItem(null);
  };

  return (
    <AdminLayout title="Manage Music" subtitle="Edit or delete music entries.">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Select Music</h2>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 mb-4"
          />
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {loading ? (
              <div>Loading...</div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectItem(item)}
                  className={`glass-dark p-4 rounded-lg cursor-pointer hover:bg-white/20 transition ${
                    selectedItem?.id === item.id ? 'border-2 border-emerald-400' : ''
                  }`}
                >
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.artist || 'Unknown Artist'}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          {selectedItem ? (
            <form onSubmit={handleSave} className="space-y-4">
              <h2 className="text-2xl font-bold">{selectedItem.title}</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium mb-2">Track Artwork URL (HTTPS)</label>
                <input
                  type="url"
                  value={formData.artwork_url}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    setFormData({ ...formData, artwork_url: value });
                    setImageError(value && (!value.startsWith('https://') || !/\.(jpg|png|webp|svg)(\?.*)?$/i.test(value)) ? 'Invalid Image URL' : '');
                  }}
                  placeholder="https://image-link.jpg"
                  className="w-full px-4 py-3 glass-input"
                />
                {imageError && <p className="text-xs text-red-400 mt-2">{imageError}</p>}
                {!imageError && formData.artwork_url && (
                  <img
                    src={formData.artwork_url}
                    alt="Artwork preview"
                    className="mt-3 w-32 h-32 rounded-xl object-cover border border-white/10"
                    loading="lazy"
                    onError={() => setImageError('Invalid Image URL')}
                  />
                )}
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

              <MusicPlatforms
                spotifyUrl={formData.spotify_url}
                appleMusicUrl={formData.apple_music_url}
                youtubeMusicUrl={formData.youtube_music_url}
                amazonMusicUrl={formData.amazon_music_url}
              />

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedItem.id)}
                  className="btn-ghost flex-1"
                >
                  Delete
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center text-gray-400 py-12">Select a music item to edit</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageMusic;
