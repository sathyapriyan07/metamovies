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
    <div>
      <h1>My Profile</h1>
      <p>{user.user_metadata?.username || 'User'}</p>
      <p>{user.email}</p>
      {user.user_metadata?.avatar_url && (
        <img src={user.user_metadata.avatar_url} alt="avatar" width={80} />
      )}

      <section className="section">
        <h2 className="section-title">Change Avatar</h2>
        {avatarOptions.length > 0 && (
          <div>
            {avatarOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedAvatar(option.url);
                  setShowCustomUrl(false);
                }}
                className="button-secondary"
                style={{ marginRight: 8, marginBottom: 8 }}
              >
                {option.name || 'Avatar'}
              </button>
            ))}
          </div>
        )}

        <button type="button" className="button-secondary" onClick={() => setShowCustomUrl(!showCustomUrl)} style={{ marginTop: 8 }}>
          {showCustomUrl ? 'Hide' : 'Use'} custom URL
        </button>

        {showCustomUrl && (
          <div style={{ marginTop: 8 }}>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="search-input"
            />
          </div>
        )}

        <button onClick={handleSave} disabled={saving} className="button-primary" style={{ marginTop: 8 }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </section>

      <section className="section">
        <button onClick={() => navigate('/watchlist')} className="button-primary">My Watchlist</button>
        <button onClick={handleSignOut} className="button-secondary" style={{ marginLeft: 8 }}>Sign Out</button>
      </section>
    </div>
  );
};

export default Profile;
