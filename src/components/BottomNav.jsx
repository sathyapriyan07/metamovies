import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { 
      to: '/', 
      label: 'Home', 
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" /></svg> 
    },
    { 
      to: '/movies', 
      label: 'Movies', 
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4z" opacity="0.35" /><path d="M4 6l4 3V6m0 3l4-3m-4 3l4 3m-4-3l-4 3m12-3l4-3m-4 3l4 3m-4-3l-4 3" /></svg> 
    },
    { 
      to: '/search', 
      label: 'Search', 
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11 4a7 7 0 105.2 11.7l3.6 3.6 1.4-1.4-3.6-3.6A7 7 0 0011 4z" /></svg> 
    },
    { 
      to: '/news', 
      label: 'News', 
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg> 
    },
    user ? (
      isAdmin ? 
        { 
          to: '/admin', 
          label: 'Admin', 
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l8 4v6c0 5-3.5 9.7-8 10-4.5-.3-8-5-8-10V6l8-4z" /></svg> 
        }
        : { 
          to: '/watchlist', 
          label: 'Watchlist', 
          icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h10a2 2 0 012 2v16l-7-4-7 4V6a2 2 0 012-2z" /></svg> 
        }
    ) : { 
      to: '/login', 
      label: 'Profile', 
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" /></svg> 
    }
  ];

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 md:hidden px-[5%]">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-around gap-2 h-16 px-3 rounded-[24px] backdrop-blur-xl bg-[rgba(28,28,30,0.85)] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          {navItems.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={`flex items-center justify-center transition-all duration-200 ${
                  active
                    ? 'glass-icon glass-icon-active w-12 h-12'
                    : 'glass-icon w-11 h-11 opacity-85'
                }`}
              >
                <span className="text-white">{item.icon}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
