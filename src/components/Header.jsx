import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Movies', to: '/movies' },
    { label: 'People', to: '/search' },
    { label: 'Platforms', to: '/platforms' },
    { label: 'Watchlist', to: '/watchlist' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full h-[50px] bg-[#0f0f0f] border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 h-full">
          <div className="h-full flex items-center justify-between">
            <button className="text-[#F5C518] font-semibold text-sm" onClick={() => navigate('/')}>
              MetaMovies+
            </button>

            <div className="flex items-center gap-4">
              <button
                className="text-white/80 hover:text-white transition"
                onClick={() => navigate('/search')}
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                className="text-white/80 hover:text-white transition"
                onClick={() => navigate(user ? '/profile' : '/login')}
                aria-label="Profile"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M4 20c2.2-3.5 13.8-3.5 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <button
                className="text-white/80 hover:text-white transition"
                onClick={() => setIsOpen(true)}
                aria-label="Open menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#111] border-r border-white/10 p-5">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[#F5C518] font-semibold">Menu</div>
              <button
                className="text-white/70 hover:text-white transition"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <button
                  key={item.to}
                  className="text-left text-sm text-white/80 hover:text-white transition"
                  onClick={() => {
                    navigate(item.to);
                    setIsOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
              {isAdmin && (
                <button
                  className="text-left text-sm text-white/80 hover:text-white transition"
                  onClick={() => {
                    navigate('/admin');
                    setIsOpen(false);
                  }}
                >
                  Admin
                </button>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;
