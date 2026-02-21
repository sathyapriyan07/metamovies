import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const TopBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/search', { state: { q: query } });
  };

  return (
    <header className="ott-topbar">
      <div className="container-desktop flex items-center gap-4">
        <form onSubmit={handleSubmit} className="ott-search max-w-[480px]">
          <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, people, platforms"
            aria-label="Search"
          />
        </form>
        <div className="ml-auto flex items-center gap-3">
          <button type="button" className="btn-icon" aria-label="Notifications">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => navigate(user ? '/profile' : '/login')}
            className="btn-icon"
            aria-label="Profile"
          >
            <Avatar
              src={user?.user_metadata?.avatar_url}
              name={user?.user_metadata?.username || user?.email || 'Guest'}
              size="sm"
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
