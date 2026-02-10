import { useEffect, useState } from 'react';
import { deleteAlbum, getAlbums, getArtists, updateAlbum } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';
import { useNavigate } from 'react-router-dom';
import MusicPlatforms from '../../components/MusicPlatforms';

const ManageAlbums = () => {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState('');
  const [form, setForm] = useState({
    title: '',
    artist_id: '',
    cover_image_url: '',
    release_year: '',
    total_duration_seconds: '',
    spotify_url: '',
    apple_music_url: '',
    youtube_music_url: '',
    amazon_music_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: albumsData }, { data: artistsData }] = await Promise.all([
      getAlbums(),
      getArtists()
    ]);
    setAlbums(albumsData || []);
    setArtists(artistsData || []);
    setFiltered(albumsData || []);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setFiltered(albums);
      return;
    }
    const lowered = value.toLowerCase();
    setFiltered(albums.filter((a) => a.title?.toLowerCase().includes(lowered)));
  };

  const selectAlbum = (album) => {
    setSelected(album);
    setImageError('');
    setForm({
      title: album.title || '',
      artist_id: album.artist_id || '',
      cover_image_url: album.cover_image_url || '',
      release_year: album.release_year || '',
      total_duration_seconds: album.total_duration_seconds || '',
      spotify_url: album.spotify_url || '',
      apple_music_url: album.apple_music_url || '',
      youtube_music_url: album.youtube_music_url || '',
      amazon_music_url: album.amazon_music_url || ''
    });
  };

  const isValidUrl = (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const isValidImageUrl = (value) => {
    if (!value) return true;
    if (!value.startsWith('https://')) return false;
    if (!/\.(jpg|png|webp|svg)(\?.*)?$/i.test(value)) return false;
    return isValidUrl(value);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selected) return;

    if (![form.spotify_url, form.apple_music_url, form.youtube_music_url, form.amazon_music_url].every(isValidUrl)) {
      alert('Please enter valid URLs for platform links.');
      return;
    }

    if (!isValidImageUrl(form.cover_image_url)) {
      alert('Please enter a valid HTTPS cover image URL.');
      return;
    }

    setSaving(true);

    await updateAlbum(selected.id, {
      title: form.title,
      artist_id: form.artist_id ? parseInt(form.artist_id, 10) : null,
      cover_image_url: form.cover_image_url || null,
      release_year: form.release_year ? parseInt(form.release_year, 10) : null,
      total_duration_seconds: form.total_duration_seconds ? parseInt(form.total_duration_seconds, 10) : null,
      spotify_url: form.spotify_url || null,
      apple_music_url: form.apple_music_url || null,
      youtube_music_url: form.youtube_music_url || null,
      amazon_music_url: form.amazon_music_url || null
    });

    await loadData();
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm('Delete this album?')) return;
    await deleteAlbum(selected.id);
    setSelected(null);
    await loadData();
  };

  return (
    <AdminLayout title="Manage Albums" subtitle="Edit album metadata and links.">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Albums</h2>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 mb-4"
          />
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map((album) => (
              <button
                key={album.id}
                onClick={() => selectAlbum(album)}
                className={`w-full text-left glass-dark p-4 rounded-lg hover:bg-white/20 transition ${
                  selected?.id === album.id ? 'border-2 border-emerald-400' : ''
                }`}
              >
                <p className="font-semibold">{album.title}</p>
                <p className="text-xs text-gray-400">{album.artist?.name || 'Unknown Artist'}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          {selected ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{selected.title}</h2>
                <button
                  type="button"
                  onClick={() => navigate(`/album/${selected.id}`)}
                  className="btn-ghost text-sm"
                >
                  View Album Page
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Artist</label>
                  <select
                    value={form.artist_id}
                    onChange={(e) => setForm({ ...form, artist_id: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                  >
                    <option value="" className="bg-black">Select artist</option>
                    {artists.map((artist) => (
                      <option key={artist.id} value={artist.id} className="bg-black">
                        {artist.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cover Image URL (HTTPS)</label>
                  <input
                    type="url"
                    value={form.cover_image_url}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      setForm({ ...form, cover_image_url: value });
                      setImageError(isValidImageUrl(value) ? '' : 'Invalid Image URL');
                    }}
                    className="w-full px-4 py-3 glass-input"
                  />
                  {imageError && <p className="text-xs text-red-400 mt-2">{imageError}</p>}
                  {!imageError && form.cover_image_url && (
                    <img
                      src={form.cover_image_url}
                      alt="Cover preview"
                      className="mt-3 w-32 h-32 rounded-xl object-cover border border-white/10"
                      loading="lazy"
                      onError={() => setImageError('Invalid Image URL')}
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Release Year</label>
                    <input
                      type="number"
                      value={form.release_year}
                      onChange={(e) => setForm({ ...form, release_year: e.target.value })}
                      className="w-full px-4 py-3 glass-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Total Duration (sec)</label>
                    <input
                      type="number"
                      value={form.total_duration_seconds}
                      onChange={(e) => setForm({ ...form, total_duration_seconds: e.target.value })}
                      className="w-full px-4 py-3 glass-input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Spotify URL</label>
                  <input
                    type="url"
                    value={form.spotify_url}
                    onChange={(e) => setForm({ ...form, spotify_url: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Apple Music URL</label>
                  <input
                    type="url"
                    value={form.apple_music_url}
                    onChange={(e) => setForm({ ...form, apple_music_url: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">YouTube Music URL</label>
                  <input
                    type="url"
                    value={form.youtube_music_url}
                    onChange={(e) => setForm({ ...form, youtube_music_url: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amazon Music URL</label>
                  <input
                    type="url"
                    value={form.amazon_music_url}
                    onChange={(e) => setForm({ ...form, amazon_music_url: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
              </div>

              <MusicPlatforms
                spotifyUrl={form.spotify_url}
                appleMusicUrl={form.apple_music_url}
                youtubeMusicUrl={form.youtube_music_url}
                amazonMusicUrl={form.amazon_music_url}
              />

              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="btn-ghost flex-1" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center text-gray-400 py-12">Select an album to edit</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageAlbums;
