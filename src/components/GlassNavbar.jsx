import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { useState } from 'react';

const GlassNavbar = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const isActive = (path) => location.pathname === path;

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/search', { state: { q: searchValue } });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block">
      <div className="glass-nav backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          <Link to="/" className="text-2xl font-semibold tracking-tight text-white">
            MetaMovies
            <span className="text-sky-400">+</span>
          </Link>

          <div className="flex items-center gap-5 text-sm font-medium text-gray-300">
            <Link to="/" className={`transition-colors ${isActive('/') ? 'text-white' : 'hover:text-white'}`}>
              Home
            </Link>
            <Link to="/movies" className={`transition-colors ${isActive('/movies') ? 'text-white' : 'hover:text-white'}`}>
              Movies
            </Link>
            <Link to="/series" className={`transition-colors ${isActive('/series') ? 'text-white' : 'hover:text-white'}`}>
              Series
            </Link>
            {user && (
              <Link to="/watchlist" className={`transition-colors ${isActive('/watchlist') ? 'text-white' : 'hover:text-white'}`}>
                Watchlist
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className={`transition-colors ${location.pathname.startsWith('/admin') ? 'text-white' : 'hover:text-white'}`}>
                Admin
              </Link>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex justify-center">
            <div className="w-full max-w-md relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search movies, shows, people"
                className="w-full pl-11 pr-4 py-2 glass-input text-sm"
                aria-label="Search"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/profile')}
                className="focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-full"
                aria-label="Profile"
              >
                <Avatar
                  src={user.user_metadata?.avatar_url}
                  name={user.user_metadata?.username || user.email}
                  size="lg"
                />
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-200 hover:text-white">
                  Log In
                </Link>
                <Link to="/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlassNavbar;
