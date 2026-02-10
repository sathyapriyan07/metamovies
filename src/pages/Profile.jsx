import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, signOut } from '../services/supabase';
import Avatar from '../components/Avatar';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [avatarOptions, setAvatarOptions] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [showCustomUrl, setShowCustomUrl] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedAvatar(user.user_metadata?.avatar_url || '');
    loadAvatarOptions();
  }, [user, navigate]);

  const loadAvatarOptions = async () => {
    const { data } = await supabase
      .from('avatar_options')
      .select('*')
      .order('created_at', { ascending: false });
    setAvatarOptions(data || []);
  };

  const handleSave = async () => {
    setSaving(true);
    const avatarUrl = showCustomUrl ? customUrl : selectedAvatar;

    const { error } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl }
    });

    if (!error) {
      alert('Profile updated successfully!');
      window.location.reload();
    } else {
      alert('Failed to update profile');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-4xl font-bold mb-8">My Profile</h1>

        {/* Current Profile */}
        <div className="glass-dark p-6 rounded-xl mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Avatar 
              src={user.user_metadata?.avatar_url} 
              name={user.user_metadata?.username || user.email}
              size="lg"
              className="w-20 h-20 text-2xl"
            />
            <div>
              <h2 className="text-2xl font-bold">{user.user_metadata?.username || 'User'}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Change Avatar */}
        <div className="glass-dark p-6 rounded-xl mb-8">
          <h3 className="text-xl font-bold mb-4">Change Avatar</h3>
          
          {/* Avatar Options Grid */}
          {avatarOptions.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-4">
              {avatarOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => { setSelectedAvatar(option.url); setShowCustomUrl(false); }}
                  className={`p-2 rounded-lg border-2 transition ${
                    selectedAvatar === option.url && !showCustomUrl
                      ? 'border-red-600 bg-red-600/20'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <Avatar src={option.url} name={option.name} size="md" />
                </button>
              ))}
            </div>
          )}

          {/* Custom URL Toggle */}
          <button
            type="button"
            onClick={() => setShowCustomUrl(!showCustomUrl)}
            className="text-sm text-red-500 hover:underline mb-3"
          >
            {showCustomUrl ? 'Hide' : 'Use'} custom URL
          </button>

          {/* Custom URL Input */}
          {showCustomUrl && (
            <div className="mb-4">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:border-red-600"
              />
              {customUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-sm text-gray-400">Preview:</span>
                  <Avatar src={customUrl} name="Preview" size="lg" />
                </div>
              )}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/watchlist')}
            className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition"
          >
            My Watchlist
          </button>
          <button
            onClick={handleSignOut}
            className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition text-red-400"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
