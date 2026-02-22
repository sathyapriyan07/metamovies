import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [editingUser, setEditingUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    setLoading(true);
    let query = supabase
      .from('users')
      .select(`
        *,
        auth_user:auth.users!inner(email, created_at)
      `)
      .order('created_at', { ascending: false });

    if (filter === 'pending') {
      query = query.is('approved', false);
    } else if (filter === 'approved') {
      query = query.eq('approved', true);
    }

    const { data } = await query;
    setUsers(data || []);
    setLoading(false);
  };

  const handleApprove = async (userId) => {
    await supabase
      .from('users')
      .update({ approved: true })
      .eq('id', userId);
    loadUsers();
  };

  const handleReject = async (userId) => {
    if (confirm('Reject this user? They will need to be manually approved.')) {
      await supabase
        .from('users')
        .update({ approved: false })
        .eq('id', userId);
      loadUsers();
    }
  };

  const handleDelete = async (userId) => {
    if (confirm('Delete this user permanently?')) {
      await supabase.auth.admin.deleteUser(userId);
      loadUsers();
    }
  };

  const handleUpdateAvatar = async () => {
    if (!editingUser) return;
    
    const { error } = await supabase.auth.admin.updateUserById(
      editingUser.id,
      { user_metadata: { avatar_url: avatarUrl } }
    );
    
    if (!error) {
      setEditingUser(null);
      setAvatarUrl('');
      loadUsers();
    }
  };

  return (
    <AdminLayout title="Manage Users" subtitle="Approve and manage user accounts.">
      <div className="glass-card rounded-2xl p-6">

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'all' ? 'bg-red-600' : 'bg-white/10'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'pending' ? 'bg-red-600' : 'bg-white/10'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg ${
              filter === 'approved' ? 'bg-red-600' : 'bg-white/10'
            }`}
          >
            Approved
          </button>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="glass-dark p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {user.avatar_url ? (
                        <img loading="lazy" src={user.avatar_url} alt={user.username || user.auth_user?.email} width={64} height={64} />
                      ) : (
                        <div>{user.username || user.auth_user?.email}</div>
                      )}
                      <div>
                        <p className="font-bold">{user.username || 'No username'}</p>
                        <p className="text-sm text-gray-400">{user.auth_user?.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>Role: <span className="text-white">{user.role}</span></span>
                      <span>Status: 
                        <span className={user.approved ? 'text-green-400' : 'text-yellow-400'}>
                          {user.approved ? ' Approved' : ' Pending'}
                        </span>
                      </span>
                      <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingUser(user); setAvatarUrl(user.avatar_url || ''); }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                    >
                      Edit Avatar
                    </button>
                    {!user.approved ? (
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReject(user.id)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm"
                      >
                        Revoke
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="text-center text-gray-400 py-12">
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Avatar Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setEditingUser(null)}>
          <div className="bg-gray-900 p-6 rounded-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Update Avatar</h3>
            <div className="mb-4 flex justify-center">
              {avatarUrl ? (
                <img loading="lazy" src={avatarUrl} alt={editingUser.username || editingUser.auth_user?.email} width={80} height={80} />
              ) : (
                <div>{editingUser.username || editingUser.auth_user?.email}</div>
              )}
            </div>
            <input 
              type="text" 
              value={avatarUrl} 
              onChange={(e) => setAvatarUrl(e.target.value)} 
              placeholder="Avatar Image URL" 
              className="w-full px-4 py-2 bg-gray-800 rounded-lg mb-4 text-white" 
            />
            <div className="flex gap-3">
              <button 
                onClick={handleUpdateAvatar} 
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Save
              </button>
              <button 
                onClick={() => setEditingUser(null)} 
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageUsers;


