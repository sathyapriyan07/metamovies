import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Toast from '../../components/Toast';
import { createStudio, deleteStudio, getStudios, updateStudio } from '../../services/supabase';

const TYPES = [
  { value: 'studio', label: 'Studio' },
  { value: 'ott', label: 'OTT' },
  { value: 'production', label: 'Production' },
  { value: 'distributor', label: 'Distributor' }
];

const emptyForm = {
  name: '',
  logo_url: '',
  type: 'studio',
  is_active: true
};

const ManageStudios = () => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [toast, setToast] = useState(null);

  const loadStudios = async () => {
    setLoading(true);
    const { data, error } = await getStudios({ activeOnly: false });
    if (error) {
      setToast({ type: 'error', message: 'Failed to load studios' });
    } else {
      setStudios(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStudios();
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

    const action = editing ? updateStudio(editing.id, payload) : createStudio(payload);
    const { error } = await action;

    if (error) {
      setToast({ type: 'error', message: error.message || 'Failed to save studio' });
    } else {
      setToast({ type: 'success', message: editing ? 'Studio updated' : 'Studio created' });
      resetForm();
      loadStudios();
    }
    setSaving(false);
  };

  const handleEdit = (studio) => {
    setEditing(studio);
    setFormData({
      name: studio.name || '',
      logo_url: studio.logo_url || '',
      type: studio.type || 'studio',
      is_active: !!studio.is_active
    });
  };

  const handleToggle = async (studio) => {
    const { error } = await updateStudio(studio.id, { is_active: !studio.is_active });
    if (error) {
      setToast({ type: 'error', message: 'Failed to update status' });
    } else {
      setToast({ type: 'success', message: `${studio.name} ${studio.is_active ? 'disabled' : 'enabled'}` });
      loadStudios();
    }
  };

  const handleDelete = async (studio) => {
    if (!confirm(`Delete ${studio.name}?`)) return;
    const { error } = await deleteStudio(studio.id);
    if (error) {
      setToast({ type: 'error', message: 'Failed to delete studio' });
    } else {
      setToast({ type: 'success', message: 'Studio deleted' });
      loadStudios();
    }
  };

  return (
    <AdminLayout title="Manage Studios" subtitle="Add and manage studio/platform mappings.">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">{editing ? 'Edit Studio' : 'Add Studio'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">Studio Name</label>
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
            {saving ? 'Saving...' : editing ? 'Update Studio' : 'Create Studio'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="glass-card rounded-2xl p-4 md:p-6">
        <h2 className="text-lg font-semibold mb-4">Studios</h2>
        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : (
          <div className="space-y-3">
            {studios.map((studio) => (
              <div key={studio.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
                <div className="w-14 h-10 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                  {studio.logo_url ? (
                    <img src={studio.logo_url} alt={studio.name} className="max-h-8 w-auto object-contain" loading="lazy" />
                  ) : (
                    <span className="text-xs text-gray-400">No logo</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{studio.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{studio.type}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(studio)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition ${studio.is_active ? 'bg-emerald-600/70' : 'bg-gray-600/70'}`}
                >
                  {studio.is_active ? 'Active' : 'Inactive'}
                </button>
                <button type="button" onClick={() => handleEdit(studio)} className="px-3 py-2 rounded-lg text-xs bg-sky-600/70">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(studio)} className="px-3 py-2 rounded-lg text-xs bg-red-600/70">
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

export default ManageStudios;
