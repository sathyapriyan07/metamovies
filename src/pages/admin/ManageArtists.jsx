import { useEffect, useMemo, useState } from 'react';
import { deleteArtist, getArtists, updateArtist } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';
import { useNavigate } from 'react-router-dom';

const ManageArtists = () => {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    profile_image_url: '',
    banner_image_url: '',
    bio: '',
    tags: '',
    instagram: '',
    twitter: '',
    facebook: '',
    website: ''
  });
  const [imageErrors, setImageErrors] = useState({
    profile: '',
    banner: ''
  });

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    const { data } = await getArtists();
    setArtists(data || []);
    setFiltered(data || []);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setFiltered(artists);
      return;
    }
    const lowered = value.toLowerCase();
    setFiltered(artists.filter((a) => a.name?.toLowerCase().includes(lowered)));
  };

  const selectArtist = (artist) => {
    setSelected(artist);
    setImageErrors({ profile: '', banner: '' });
    setForm({
      name: artist.name || '',
      profile_image_url: artist.profile_image_url || '',
      banner_image_url: artist.banner_image_url || '',
      bio: artist.bio || '',
      tags: (artist.tags || []).join(', '),
      instagram: artist.social_links?.instagram || '',
      twitter: artist.social_links?.twitter || '',
      facebook: artist.social_links?.facebook || '',
      website: artist.social_links?.website || ''
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

    if (![form.instagram, form.twitter, form.facebook, form.website].every(isValidUrl)) {
      alert('Please enter valid URLs for social links.');
      return;
    }

    if (!isValidImageUrl(form.profile_image_url) || !isValidImageUrl(form.banner_image_url)) {
      alert('Please enter valid HTTPS image URLs.');
      return;
    }

    setSaving(true);

    await updateArtist(selected.id, {
      name: form.name,
      profile_image_url: form.profile_image_url || null,
      banner_image_url: form.banner_image_url || null,
      bio: form.bio || null,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : null,
      social_links: {
        instagram: form.instagram || null,
        twitter: form.twitter || null,
        facebook: form.facebook || null,
        website: form.website || null
      }
    });

    await loadArtists();
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm('Delete this artist?')) return;
    await deleteArtist(selected.id);
    setSelected(null);
    await loadArtists();
  };

  const previewProfile = useMemo(() => form.profile_image_url, [form.profile_image_url]);
  const previewBanner = useMemo(() => form.banner_image_url, [form.banner_image_url]);

  return (
    <AdminLayout title="Manage Artists" subtitle="Edit artist profiles and links.">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-4">Artists</h2>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 mb-4"
          />
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map((artist) => (
              <button
                key={artist.id}
                onClick={() => selectArtist(artist)}
                className={`w-full text-left glass-dark p-4 rounded-lg hover:bg-white/20 transition ${
                  selected?.id === artist.id ? 'border-2 border-emerald-400' : ''
                }`}
              >
                <p className="font-semibold">{artist.name}</p>
                <p className="text-xs text-gray-400">{(artist.tags || []).join(', ')}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          {selected ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{selected.name}</h2>
                <button
                  type="button"
                  onClick={() => navigate(`/artist/${selected.id}`)}
                  className="btn-ghost text-sm"
                >
                  View Artist Page
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="Pop, Indie, OST"
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Profile Image URL (HTTPS)</label>
                  <input
                    type="url"
                    value={form.profile_image_url}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      setForm({ ...form, profile_image_url: value });
                      setImageErrors((prev) => ({
                        ...prev,
                        profile: isValidImageUrl(value) ? '' : 'Invalid Image URL'
                      }));
                    }}
                    className="w-full px-4 py-3 glass-input"
                  />
                  {imageErrors.profile && <p className="text-xs text-red-400 mt-2">{imageErrors.profile}</p>}
                  {!imageErrors.profile && previewProfile && (
                    <img
                      src={previewProfile}
                      alt="Profile preview"
                      className="mt-3 w-24 h-24 rounded-full object-cover border border-white/10"
                      loading="lazy"
                      onError={() => setImageErrors((prev) => ({ ...prev, profile: 'Invalid Image URL' }))}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Banner Image URL (HTTPS)</label>
                  <input
                    type="url"
                    value={form.banner_image_url}
                    onChange={(e) => {
                      const value = e.target.value.trim();
                      setForm({ ...form, banner_image_url: value });
                      setImageErrors((prev) => ({
                        ...prev,
                        banner: isValidImageUrl(value) ? '' : 'Invalid Image URL'
                      }));
                    }}
                    className="w-full px-4 py-3 glass-input"
                  />
                  {imageErrors.banner && <p className="text-xs text-red-400 mt-2">{imageErrors.banner}</p>}
                  {!imageErrors.banner && previewBanner && (
                    <img
                      src={previewBanner}
                      alt="Banner preview"
                      className="mt-3 w-full h-24 rounded-xl object-cover border border-white/10"
                      loading="lazy"
                      onError={() => setImageErrors((prev) => ({ ...prev, banner: 'Invalid Image URL' }))}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Biography</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full px-4 py-3 glass-input"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Instagram</label>
                  <input
                    type="url"
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Twitter / X</label>
                  <input
                    type="url"
                    value={form.twitter}
                    onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Facebook</label>
                  <input
                    type="url"
                    value={form.facebook}
                    onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    className="w-full px-4 py-3 glass-input"
                  />
                </div>
              </div>

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
            <div className="text-center text-gray-400 py-12">Select an artist to edit</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageArtists;
