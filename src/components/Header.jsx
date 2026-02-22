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
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-[60px] bg-black">
      <div className="max-w-7xl mx-auto px-4 h-full">
        <div className="h-full flex items-center justify-between">
          <button className="text-base font-semibold" onClick={() => navigate('/')}>
            MetaMovies+
          </button>
          <div className="flex items-center gap-3 text-sm">
            {isAdmin && (
              <button className="hover:text-white/80 transition" onClick={() => navigate('/admin')}>
                Admin
              </button>
            )}
            <button className="hover:text-white/80 transition" onClick={() => navigate(user ? '/profile' : '/login')}>
              {user ? 'Profile' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
