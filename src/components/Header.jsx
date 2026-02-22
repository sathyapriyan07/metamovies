import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/search', { state: { q: query } });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-black/95 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center gap-3">
          <button className="flex items-center gap-2 shrink-0" onClick={() => navigate('/')}>
            <span className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
              <img src="/favicon.png" alt="MetaMovies" className="h-5 w-5 rounded-full" />
            </span>
            <span className="text-sm font-semibold whitespace-nowrap">MetaMovies</span>
          </button>
          <form onSubmit={handleSubmit} className="flex-1">
            <input
              className="w-full max-w-md bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:border-white/30"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, people, platforms"
              aria-label="Search"
            />
          </form>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition" onClick={() => navigate('/admin')}>
                Admin
              </button>
            )}
            <button className="text-xs px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition" onClick={() => navigate(user ? '/profile' : '/login')}>
              {user ? 'Profile' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
