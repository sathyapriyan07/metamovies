import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase, signOut } from '../services/supabase';

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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1a1a1a]">
            {user.user_metadata?.avatar_url ? (
              <img loading="lazy" src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm">
                {user.user_metadata?.username?.[0] || 'U'}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-lg font-semibold">{user.user_metadata?.username || 'User'}</h1>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Change Avatar</h2>
          {avatarOptions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {avatarOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(option.url);
                    setShowCustomUrl(false);
                  }}
                  className="bg-[#1a1a1a] text-sm px-3 py-2 rounded-md"
                >
                  {option.name || 'Avatar'}
                </button>
              ))}
            </div>
          )}

          <button type="button" className="mt-3 text-sm text-gray-400 hover:text-white" onClick={() => setShowCustomUrl(!showCustomUrl)}>
            {showCustomUrl ? 'Hide' : 'Use'} custom URL
          </button>

          {showCustomUrl && (
            <div className="mt-3">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full bg-[#1a1a1a] rounded-md px-3 py-2 text-sm"
              />
            </div>
          )}

          <button onClick={handleSave} disabled={saving} className="mt-4 btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </section>

        <section className="py-6">
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/watchlist')} className="btn-primary">My Watchlist</button>
            <button onClick={handleSignOut} className="btn-secondary">Sign Out</button>
          </div>
        </section>
      </div>
    </div>
  );

};

export default Profile;
