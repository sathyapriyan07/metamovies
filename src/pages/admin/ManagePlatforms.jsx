import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { createPlatform, deletePlatform, getPlatforms, updatePlatform } from '../../services/supabase';

const TYPES = [
  { value: 'platform', label: 'Platform' },
  { value: 'ott', label: 'OTT' },
  { value: 'production', label: 'Production' },
  { value: 'distributor', label: 'Distributor' }
];

const emptyForm = {
  name: '',
  logo_url: '',
  type: 'platform',
  is_active: true
};

const ManagePlatforms = () => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [toast, setToast] = useState(null);

  const loadPlatforms = async () => {
    setLoading(true);
    const { data, error } = await getPlatforms({ activeOnly: false });
    if (error) {
      setToast({ type: 'error', message: 'Failed to load platforms' });
    } else {
      setPlatforms(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPlatforms();
  }, []);

  const resetForm = () => {
    setEditing(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    const payload = {
      name: formData.name.trim(),
      logo_url: formData.logo_url.trim() || null,
      type: formData.type,
      is_active: !!formData.is_active
    };

    const action = editing ? updatePlatform(editing.id, payload) : createPlatform(payload);
    const { error } = await action;

    if (error) {
      setToast({ type: 'error', message: error.message || 'Failed to save platform' });
    } else {
      setToast({ type: 'success', message: editing ? 'Platform updated' : 'Platform created' });
      resetForm();
      loadPlatforms();
    }
    setSaving(false);
  };

  const handleEdit = (platform) => {
    setEditing(platform);
    setFormData({
      name: platform.name || '',
      logo_url: platform.logo_url || '',
      type: platform.type || 'platform',
      is_active: !!platform.is_active
    });
  };

  const handleToggle = async (platform) => {
    const { error } = await updatePlatform(platform.id, { is_active: !platform.is_active });
    if (error) {
      setToast({ type: 'error', message: 'Failed to update status' });
    } else {
      setToast({ type: 'success', message: `${platform.name} ${platform.is_active ? 'disabled' : 'enabled'}` });
      loadPlatforms();
    }
  };

  const handleDelete = async (platform) => {
    if (!confirm(`Delete ${platform.name}?`)) return;
    const { error } = await deletePlatform(platform.id);
    if (error) {
      setToast({ type: 'error', message: 'Failed to delete platform' });
    } else {
      setToast({ type: 'success', message: 'Platform deleted' });
      loadPlatforms();
    }
  };

  return (
    <AdminLayout title="Manage Platforms" subtitle="Add and manage platform mappings.">
      {toast && <div>{toast.message}</div>}

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">{editing ? 'Edit Platform' : 'Add Platform'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">Platform Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 glass-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Logo URL</label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData((prev) => ({ ...prev, logo_url: e.target.value }))}
              className="w-full px-4 py-3 glass-input"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Platform Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full px-4 py-3 glass-input"
            >
              {TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm mt-8">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4"
            />
            Active
          </label>
        </div>

        {formData.logo_url && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-gray-400 mb-2">Logo Preview</p>
            <img src={formData.logo_url} alt="Logo preview" className="h-10 w-auto object-contain" loading="lazy" />
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? 'Saving...' : editing ? 'Update Platform' : 'Create Platform'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="glass-card rounded-2xl p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Platforms</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-3">
            {platforms.map((platform) => (
              <div key={platform.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                <div className="w-14 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                  {platform.logo_url ? (
                    <img src={platform.logo_url} alt={platform.name} className="max-h-8 w-auto object-contain" loading="lazy" />
                  ) : (
                    <span className="text-xs text-gray-400">No logo</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{platform.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{platform.type}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(platform)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition ${platform.is_active ? 'bg-white/14 border border-white/18' : 'bg-gray-600/70'}`}
                >
                  {platform.is_active ? 'Active' : 'Inactive'}
                </button>
                <button type="button" onClick={() => handleEdit(platform)} className="px-3 py-2 rounded-lg text-xs bg-white/12 border border-white/16 hover:bg-white/18">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(platform)} className="px-3 py-2 rounded-lg text-xs bg-red-600/70">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManagePlatforms;




