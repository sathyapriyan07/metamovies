import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark hidden md:block border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">          <Link 
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
                  onClick={() => navigate('/profile')} 
                  className="focus:outline-none focus:ring-2 focus:ring-red-600 rounded-full"
                  aria-label="Profile"
                >
                  <Avatar 
                    src={user.user_metadata?.avatar_url} 
                    name={user.user_metadata?.username || user.email}
                    size="lg"
                  />
                </button>
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


