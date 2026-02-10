import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUp } from '../services/supabase';
import { supabase } from '../services/supabase';
import Avatar from '../components/Avatar';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarOptions, setAvatarOptions] = useState([]);
  const [showCustomUrl, setShowCustomUrl] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvatarOptions();
  }, []);

  const loadAvatarOptions = async () => {
    const { data } = await supabase
      .from('avatar_options')
      .select('*')
      .order('created_at', { ascending: false });
    setAvatarOptions(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signUp(email, password, username, avatarUrl);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="glass-card rounded-2xl w-full max-w-md p-8">
        <p className="text-sky-300 text-xs uppercase tracking-[0.3em] text-center">Get Started</p>
        <h1 className="text-3xl font-semibold text-center mt-3 mb-8">Join MetaMovies+</h1>

        {error && (
          <div className="bg-red-500/15 border border-red-500/40 text-red-200 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 glass-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 glass-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 glass-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Choose Avatar (Optional)</label>
            {avatarOptions.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-3">
                {avatarOptions.slice(0, 8).map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(option.url);
                      setShowCustomUrl(false);
                    }}
                    className={`p-2 rounded-xl border-2 transition ${
                      avatarUrl === option.url
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
              className="text-sm text-sky-300 hover:text-white mb-2"
            >
              {showCustomUrl ? 'Hide' : 'Use'} custom URL
            </button>
            {showCustomUrl && (
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 glass-input"
              />
            )}
          </div>

          <button type="submit" className="w-full btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-300 hover:text-white">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
