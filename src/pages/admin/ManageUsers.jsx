import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved

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

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Manage Users</h1>

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
                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
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
    </div>
  );
};

export default ManageUsers;
