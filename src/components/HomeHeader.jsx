import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/supabase';
import { useState } from 'react';

const HomeHeader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowMenu(false);
    navigate('/');
  };

  return (
    <div className="w-full bg-black sticky top-0 z-40 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {/* Search Bar */}
        <div 
          onClick={() => navigate('/search')}
          className="flex-1 max-w-2xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all duration-200 focus-within:ring-1 focus-within:ring-red-600"
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
          <span className="text-gray-300 text-sm md:text-base">Movies, shows and more</span>
        </div>

        {/* Login / Profile Button */}
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white font-bold transition-all duration-200 hover:scale-105"
              aria-label="User Menu"
            >
              {user.user_metadata?.username?.[0]?.toUpperCase() || 'U'}
            </button>
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-lg py-2 shadow-xl z-50">
                  <button 
                    onClick={() => { navigate('/watchlist'); setShowMenu(false); }} 
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                  >
                    Watchlist
                  </button>
                  <button 
                    onClick={handleSignOut} 
                    className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all duration-200 whitespace-nowrap"
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
