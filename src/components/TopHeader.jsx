import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const TopHeader = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  return (
    <header className="md:hidden sticky top-0 z-40 px-4 pt-[max(env(safe-area-inset-top),10px)] pb-1 bg-gradient-to-b from-[#060a12]/95 to-[#060a12]/65 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="inline-flex items-center gap-2 min-w-0">
          <img
            src="/favicon.png"
            alt="MetaMovies"
            loading="lazy"
            className="h-8 w-8 object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.22)]"
          />
          <span className="text-base font-semibold tracking-tight text-white truncate">
            MetaMovies<span className="text-sky-400">+</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/search')}
            aria-label="Search"
            className="w-10 h-10 rounded-full bg-white/8 hover:bg-white/14 border border-white/15 flex items-center justify-center transition"
          >
            <svg className="w-5 h-5 text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              aria-label="Admin"
              className="w-10 h-10 rounded-full bg-white/8 hover:bg-white/14 border border-white/15 flex items-center justify-center transition"
            >
              <svg className="w-5 h-5 text-slate-100" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l8 4v6c0 5-3.5 9.7-8 10-4.5-.3-8-5-8-10V6l8-4z" />
              </svg>
            </button>
          )}

          {user ? (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              aria-label="Profile"
              className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center"
            >
              <Avatar
                src={user.user_metadata?.avatar_url}
                name={user.user_metadata?.username || user.email}
                size="md"
              />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="h-10 px-3 rounded-full bg-white/8 hover:bg-white/14 border border-white/15 text-sm text-white inline-flex items-center">
                Log In
              </Link>
              <Link to="/signup" className="h-10 px-3 rounded-full bg-sky-500/30 hover:bg-sky-500/40 border border-sky-300/35 text-sm text-white inline-flex items-center">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
