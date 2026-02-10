import { useEffect, useState } from 'react';
import { deleteTrack, getAlbums, getTracks, updateTrack } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';
import MusicPlatforms from '../../components/MusicPlatforms';

const formatDuration = (seconds) => {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const parseDuration = (value) => {
  if (!value) return null;
  if (value.includes(':')) {
    const [m, s] = value.split(':').map((v) => parseInt(v, 10));
    if (Number.isNaN(m) || Number.isNaN(s)) return null;
    return m * 60 + s;
  }
  const asNumber = parseInt(value, 10);
  return Number.isNaN(asNumber) ? null : asNumber;
};

const ManageTracks = () => {
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    album_id: '',
    duration: '',
    preview_url: '',
    artwork_url: '',
    spotify_url: '',
    apple_music_url: '',
    youtube_music_url: '',
    amazon_music_url: ''
  });
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [{ data: tracksData }, { data: albumsData }] = await Promise.all([
      getTracks(),
      getAlbums()
    ]);
    setTracks(tracksData || []);
    setAlbums(albumsData || []);
    setFiltered(tracksData || []);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setFiltered(tracks);
      return;
    }
    const lowered = value.toLowerCase();
    setFiltered(tracks.filter((t) => t.title?.toLowerCase().includes(lowered)));
  };

  const selectTrack = (track) => {
    setSelected(track);
    setImageError('');
    setForm({
      title: track.title || '',
      album_id: track.album_id || '',
      duration: track.duration_seconds ? formatDuration(track.duration_seconds) : '',
      preview_url: track.preview_url || '',
      artwork_url: track.artwork_url || '',
      spotify_url: track.spotify_url || '',
      apple_music_url: track.apple_music_url || '',
      youtube_music_url: track.youtube_music_url || '',
      amazon_music_url: track.amazon_music_url || ''
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

    if (![form.preview_url, form.spotify_url, form.apple_music_url, form.youtube_music_url, form.amazon_music_url].every(isValidUrl)) {
      alert('Please enter valid URLs.');
      return;
    }

    if (!isValidImageUrl(form.artwork_url)) {
      alert('Please enter a valid HTTPS artwork URL.');
      return;
    }

    setSaving(true);
    await updateTrack(selected.id, {
      title: form.title,
      album_id: form.album_id ? parseInt(form.album_id, 10) : null,
      duration_seconds: parseDuration(form.duration),
      preview_url: form.preview_url || null,
      artwork_url: form.artwork_url || null,
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
    if (!confirm('Delete this track?')) return;
    await deleteTrack(selected.id);
    setSelected(null);
    await loadData();
  };

  return (
    <AdminLayout title="Manage Tracks" subtitle="Edit track metadata and platform links.">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Tracks</h2>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 mb-4"
          />
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map((track) => (
              <button
                key={track.id}
                onClick={() => selectTrack(track)}
                className={`w-full text-left glass-dark p-4 rounded-lg hover:bg-white/20 transition ${
                  selected?.id === track.id ? 'border-2 border-emerald-400' : ''
                }`}
              >
                <p className="font-semibold">{track.title}</p>
                <p className="text-xs text-gray-400">{track.album?.title || 'Unknown Album'}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          {selected ? (
            <form onSubmit={handleSave} className="space-y-4">
              <h2 className="text-2xl font-bold">{selected.title}</h2>

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
                  <label className="block text-sm font-medium mb-2">Album</label>
                  <select
                    value={form.album_id}
                    onChange={(e) => setForm({ ...form, album_id: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                  >
                    <option value="" className="bg-black">Select album</option>
                    {albums.map((album) => (
                      <option key={album.id} value={album.id} className="bg-black">
                        {album.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (mm:ss)</label>
                  <input
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preview URL</label>
                  <input
                    type="url"
                    value={form.preview_url}
                    onChange={(e) => setForm({ ...form, preview_url: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Artwork URL (HTTPS)</label>
                <input
                  type="url"
                  value={form.artwork_url}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    setForm({ ...form, artwork_url: value });
                    setImageError(isValidImageUrl(value) ? '' : 'Invalid Image URL');
                  }}
                  className="w-full px-4 py-3 glass-input"
                />
                {imageError && <p className="text-xs text-red-400 mt-2">{imageError}</p>}
                {!imageError && form.artwork_url && (
                  <img
                    src={form.artwork_url}
                    alt="Artwork preview"
                    className="mt-3 w-24 h-24 rounded-xl object-cover border border-white/10"
                    loading="lazy"
                    onError={() => setImageError('Invalid Image URL')}
                  />
                )}
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
            <div className="text-center text-gray-400 py-12">Select a track to edit</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageTracks;
