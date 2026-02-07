import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MobileNav = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass md:hidden border-t border-white/10">
      <div className="flex items-center justify-around py-3">
        <Link to="/" className={`flex flex-col items-center gap-1 transition-colors ${
          isActive('/') ? 'text-red-500' : 'text-gray-400'
        }`}>
          <span className="text-2xl">🏠</span>
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link to="/movies" className={`flex flex-col items-center gap-1 transition-colors ${
          isActive('/movies') ? 'text-red-500' : 'text-gray-400'
        }`}>
          <span className="text-2xl">🎬</span>
          <span className="text-xs font-medium">Movies</span>
        </Link>
        <Link to="/series" className={`flex flex-col items-center gap-1 transition-colors ${
          isActive('/series') ? 'text-red-500' : 'text-gray-400'
        }`}>
          <span className="text-2xl">📺</span>
          <span className="text-xs font-medium">Series</span>
        </Link>
        <Link to="/search" className={`flex flex-col items-center gap-1 transition-colors ${
          isActive('/search') ? 'text-red-500' : 'text-gray-400'
        }`}>
          <span className="text-2xl">🔍</span>
          <span className="text-xs font-medium">Search</span>
        </Link>
        {user ? (
          isAdmin ? (
            <Link to="/admin" className={`flex flex-col items-center gap-1 transition-colors ${
              location.pathname.startsWith('/admin') ? 'text-red-500' : 'text-gray-400'
            }`}>
              <span className="text-2xl">⚙️</span>
              <span className="text-xs font-medium">Admin</span>
            </Link>
          ) : (
            <Link to="/watchlist" className={`flex flex-col items-center gap-1 transition-colors ${
              isActive('/watchlist') ? 'text-red-500' : 'text-gray-400'
            }`}>
              <span className="text-2xl">📋</span>
              <span className="text-xs font-medium">List</span>
            </Link>
          )
        ) : (
          <Link to="/login" className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/login') ? 'text-red-500' : 'text-gray-400'
          }`}>
            <span className="text-2xl">👤</span>
            <span className="text-xs font-medium">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;
