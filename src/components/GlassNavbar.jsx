import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import ThemeToggle from './ThemeToggle';
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
      <div className="glass-nav surface-line">
        <div className="container-desktop h-16 flex items-center">
          <Link to="/" className="text-2xl font-semibold tracking-tight text-white flex-shrink-0">
            MetaMovies
            <span className="text-white/90">+</span>
          </Link>

          <div className="flex-1 flex items-center justify-center gap-5 text-sm font-medium text-gray-300">
            <Link to="/" className={`glass-nav-item ${isActive('/') ? 'glass-nav-item-active' : ''}`}>
              Home
            </Link>
            <Link to="/movies" className={`glass-nav-item ${isActive('/movies') ? 'glass-nav-item-active' : ''}`}>
              Movies
            </Link>
            <Link to="/platforms" className={`glass-nav-item ${location.pathname.startsWith('/platforms') ? 'glass-nav-item-active' : ''}`}>
              Platforms
            </Link>
            <Link to="/videos" className={`glass-nav-item ${isActive('/videos') ? 'glass-nav-item-active' : ''}`}>
              Videos
            </Link>
            <Link to="/news" className={`glass-nav-item ${isActive('/news') ? 'glass-nav-item-active' : ''}`}>
              News
            </Link>
            {user && (
              <Link to="/watchlist" className={`glass-nav-item ${isActive('/watchlist') ? 'glass-nav-item-active' : ''}`}>
                Watchlist
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className={`glass-nav-item ${location.pathname.startsWith('/admin') ? 'glass-nav-item-active' : ''}`}>
                Admin
              </Link>
            )}
          </div>

          <form onSubmit={handleSubmit} className="hidden lg:flex justify-center">
            <div className="w-[460px] relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search movies and people"
                className="w-full pl-11 pr-4 py-2 glass-input text-sm"
                aria-label="Search"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <button
                onClick={() => navigate('/profile')}
                className="focus:outline-none focus:ring-2 focus:ring-white/40 rounded-full"
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


