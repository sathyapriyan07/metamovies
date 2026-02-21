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
        <button className="header-left" onClick={() => navigate('/')}>
          <span className="logo-circle">
            <img src="/favicon.png" alt="MetaMovies" className="logo-mark" />
          </span>
          <span className="logo-text">MetaMovies</span>
        </button>
        <form onSubmit={handleSubmit} className="header-search">
          <input
            className="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, people, platforms"
            aria-label="Search"
          />
        </form>
        <div className="header-right">
          {isAdmin && (
            <button className="header-btn" onClick={() => navigate('/admin')}>
              Admin
            </button>
          )}
          <button className="header-btn" onClick={() => navigate(user ? '/profile' : '/login')}>
            {user ? 'Profile' : 'Login'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
