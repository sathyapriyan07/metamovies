import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const ManageAvatars = () => {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [newAvatarName, setNewAvatarName] = useState('');

  useEffect(() => {
    loadAvatars();
  }, []);

  const loadAvatars = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('avatar_options')
      .select('*')
      .order('created_at', { ascending: false });
    setAvatars(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newAvatarUrl.trim()) return;
    
    await supabase.from('avatar_options').insert({
      url: newAvatarUrl,
      name: newAvatarName || 'Avatar'
    });
    
    setNewAvatarUrl('');
    setNewAvatarName('');
    loadAvatars();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this avatar option?')) {
      await supabase.from('avatar_options').delete().eq('id', id);
      loadAvatars();
    }
  };

  return (
    <AdminLayout title="Manage Avatars" subtitle="Add or remove avatar options.">
      <div className="glass-card rounded-2xl p-6">

        {/* Add New Avatar */}
        <div className="glass-dark p-6 rounded-xl mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Avatar</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={newAvatarName}
              onChange={(e) => setNewAvatarName(e.target.value)}
              placeholder="Avatar Name (optional)"
              className="flex-1 px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:border-red-600"
            />
            <input
              type="url"
              value={newAvatarUrl}
              onChange={(e) => setNewAvatarUrl(e.target.value)}
              placeholder="Avatar Image URL"
              className="flex-1 px-4 py-2 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:border-red-600"
            />
            <button
              onClick={handleAdd}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Add
            </button>
          </div>
          {newAvatarUrl && (
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-gray-400">Preview:</span>
              <img loading="lazy" src={newAvatarUrl} alt="Preview" width={64} height={64} />
            </div>
          )}
        </div>

        {/* Avatar List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {avatars.map((avatar) => (
              <div key={avatar.id} className="glass-dark p-4 rounded-xl text-center">
                <div className="flex justify-center mb-3">
                  {avatar.url ? (
                    <img loading="lazy" src={avatar.url} alt={avatar.name} width={64} height={64} />
                  ) : (
                    <div>{avatar.name}</div>
                  )}
                </div>
                <p className="text-sm text-gray-300 mb-3 truncate">{avatar.name}</p>
                <button
                  onClick={() => handleDelete(avatar.id)}
                  className="w-full px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                >
                  Delete
                </button>
              </div>
            ))}
            {avatars.length === 0 && (
              <div className="col-span-full text-center text-gray-400 py-12">
                No avatar options yet. Add some above.
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageAvatars;


