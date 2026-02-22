import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../services/supabase';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <h1 className="text-lg font-semibold">Login</h1>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-gray-400">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="btn-primary h-10 w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-400">
          Don&apos;t have an account? <Link to="/signup" className="text-[#F5C518]">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
