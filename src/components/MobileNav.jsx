import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass md:hidden border-t border-white/10">
      <div className="flex items-center justify-around py-4">
        <Link to="/" className={`transition-colors font-medium ${
          isActive('/') ? 'text-red-500' : 'text-gray-400'
        }`}>
          Home
        </Link>
        <Link to="/movies" className={`transition-colors font-medium ${
          isActive('/movies') ? 'text-red-500' : 'text-gray-400'
        }`}>
          Movies
        </Link>
        <Link to="/series" className={`transition-colors font-medium ${
          isActive('/series') ? 'text-red-500' : 'text-gray-400'
        }`}>
          Series
        </Link>
        <Link to="/search" className={`transition-colors font-medium ${
          isActive('/search') ? 'text-red-500' : 'text-gray-400'
        }`}>
          Search
        </Link>
        {user ? (
          isAdmin ? (
            <Link to="/admin" className={`transition-colors font-medium ${
              location.pathname.startsWith('/admin') ? 'text-red-500' : 'text-gray-400'
            }`}>
              Admin
            </Link>
          ) : (
            <Link to="/watchlist" className={`transition-colors font-medium ${
              isActive('/watchlist') ? 'text-red-500' : 'text-gray-400'
            }`}>
              Watchlist
            </Link>
          )
        ) : (
          <Link to="/login" className={`transition-colors font-medium ${
            isActive('/login') ? 'text-red-500' : 'text-gray-400'
          }`}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;
