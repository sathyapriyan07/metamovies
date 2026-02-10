import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/supabase';
import { useState } from 'react';
import Avatar from './Avatar';

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark hidden md:block border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-red-600 tracking-tight">MetaMovies</Link>
        
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className={`hover:text-red-500 transition-colors font-medium relative ${
              isActive('/') ? 'text-red-500 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-red-500' : ''
            }`}
          >
            Home
          </Link>
          <Link 
            to="/movies" 
            className={`hover:text-red-500 transition-colors font-medium relative ${
              isActive('/movies') ? 'text-red-500 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-red-500' : ''
            }`}
          >
            Movies
          </Link>
          <Link 
            to="/series" 
            className={`hover:text-red-500 transition-colors font-medium relative ${
              isActive('/series') ? 'text-red-500 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-red-500' : ''
            }`}
          >
            Series
          </Link>
          <Link 
            to="/search" 
            className={`hover:text-red-500 transition-colors font-medium relative ${
              isActive('/search') ? 'text-red-500 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-red-500' : ''
            }`}
          >
            Search
          </Link>
          
          {user ? (
            <>
              <Link 
                to="/watchlist" 
                className={`hover:text-red-500 transition-colors font-medium relative ${
                  isActive('/watchlist') ? 'text-red-500 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-red-500' : ''
                }`}
              >
                Watchlist
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`hover:text-red-500 transition-colors font-medium relative ${
                    location.pathname.startsWith('/admin') ? 'text-red-500 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-red-500' : ''
                  }`}
                >
                  Admin
                </Link>
              )}
              <div className="relative">
                <button 
                  onClick={() => setShowMenu(!showMenu)} 
                  className="focus:outline-none focus:ring-2 focus:ring-red-600 rounded-full"
                  aria-label="User Menu"
                >
                  <Avatar 
                    src={user.user_metadata?.avatar_url} 
                    name={user.user_metadata?.username || user.email}
                    size="lg"
                  />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 glass-dark rounded-lg py-2 shadow-xl">
                    <button 
                      onClick={handleSignOut} 
                      className="w-full px-4 py-2 text-left hover:bg-white/10 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-red-500 transition-colors font-medium">Login</Link>
              <Link to="/signup" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
