import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const HomeHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="w-full glass-nav sticky top-0 z-40 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div
          onClick={() => navigate('/search')}
          className="flex-1 max-w-2xl glass-search py-2"
          role="button"
          tabIndex={0}
          aria-label="Search Movies"
          onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
        >
          <svg 
            className="w-5 h-5 text-gray-400 flex-shrink-0" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-gray-300 text-sm md:text-base">Movies and more</span>
        </div>

        {/* Login / Profile Button */}
        {user ? (
          <div className="relative">
            <button 
              onClick={() => navigate('/profile')} 
            className="focus:outline-none focus:ring-2 focus:ring-white/40 rounded-full"
              aria-label="Profile"
            >
              <Avatar 
                src={user.user_metadata?.avatar_url} 
                name={user.user_metadata?.username || user.email}
              />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-full btn-primary text-sm font-medium whitespace-nowrap"
            aria-label="Login"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default HomeHeader;


