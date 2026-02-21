import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/search', { state: { q: query } });
  };

  return (
    <header className="header">
      <div className="header-inner">
        <button className="logo" onClick={() => navigate('/')}>
          <img src="/favicon.png" alt="MetaMovies" className="logo-mark" />
          <span>MetaMovies</span>
        </button>
        <form onSubmit={handleSubmit} style={{ flex: 1 }}>
          <input
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, people, platforms"
            aria-label="Search"
          />
        </form>
        <div className="header-actions">
          {isAdmin && (
            <button className="button-primary" onClick={() => navigate('/admin')}>
              Admin
            </button>
          )}
          <button className="button-primary" onClick={() => navigate(user ? '/profile' : '/login')}>
            {user ? 'Profile' : 'Login'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
