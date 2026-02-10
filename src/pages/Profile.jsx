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
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <p className="text-sky-300 text-xs uppercase tracking-[0.3em]">Account</p>
          <h1 className="text-3xl md:text-5xl font-semibold mt-2">My Profile</h1>
        </div>

        <div className="glass-card p-6 rounded-2xl mb-8">
          <div className="flex items-center gap-4">
            <Avatar
              src={user.user_metadata?.avatar_url}
              name={user.user_metadata?.username || user.email}
              size="lg"
              className="w-20 h-20 text-2xl"
            />
            <div>
              <h2 className="text-2xl font-semibold">{user.user_metadata?.username || 'User'}</h2>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl mb-8">
          <h3 className="text-xl font-semibold mb-4">Change Avatar</h3>

          {avatarOptions.length > 0 && (
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mb-4">
              {avatarOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(option.url);
                    setShowCustomUrl(false);
                  }}
                  className={`p-2 rounded-xl border-2 transition ${
                    selectedAvatar === option.url && !showCustomUrl
                      ? 'border-sky-300/70 bg-sky-400/20'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <Avatar src={option.url} name={option.name} size="md" />
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowCustomUrl(!showCustomUrl)}
            className="text-sm text-sky-300 hover:text-white mb-3"
          >
            {showCustomUrl ? 'Hide' : 'Use'} custom URL
          </button>

          {showCustomUrl && (
            <div className="mb-4">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 glass-input"
              />
              {customUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-sm text-gray-400">Preview:</span>
                  <Avatar src={customUrl} name="Preview" size="lg" />
                </div>
              )}
            </div>
          )}

          <button onClick={handleSave} disabled={saving} className="w-full btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-3">
          <button onClick={() => navigate('/watchlist')} className="w-full btn-ghost">
            My Watchlist
          </button>
          <button onClick={handleSignOut} className="w-full btn-ghost text-red-300">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
