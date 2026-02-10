import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navItem = (to, label, icon) => (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${isActive(to) ? 'text-sky-300' : 'text-gray-400'}`}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-nav backdrop-blur-2xl border-t border-white/10">
        <div className="flex items-center justify-around py-3">
          {navItem(
            '/',
            'Home',
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
            </svg>
          )}
          {navItem(
            '/movies',
            'Movies',
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v12H4z" opacity="0.35" />
              <path d="M4 6l4 3V6m0 3l4-3m-4 3l4 3m-4-3l-4 3m12-3l4-3m-4 3l4 3m-4-3l-4 3" />
            </svg>
          )}
          {navItem(
            '/series',
            'Series',
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 5h16v10H4z" opacity="0.35" />
              <path d="M7 19h10v-2H7zm4-9l5 3-5 3z" />
            </svg>
          )}
          {navItem(
            '/search',
            'Search',
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 4a7 7 0 105.2 11.7l3.6 3.6 1.4-1.4-3.6-3.6A7 7 0 0011 4z" />
            </svg>
          )}
          {user ? (
            isAdmin ? (
              navItem(
                '/admin',
                'Admin',
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l8 4v6c0 5-3.5 9.7-8 10-4.5-.3-8-5-8-10V6l8-4z" />
                </svg>
              )
            ) : (
              navItem(
                '/watchlist',
                'Watchlist',
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 4h10a2 2 0 012 2v16l-7-4-7 4V6a2 2 0 012-2z" />
                </svg>
              )
            )
          ) : (
            navItem(
              '/login',
              'Profile',
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />
              </svg>
            )
          )}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
