import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path, startsWith = false) => (
    startsWith ? location.pathname.startsWith(path) : location.pathname === path
  );

  const navItems = [
    { 
      to: '/', 
      label: 'Home', 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" /></svg> 
    },
    { 
      to: '/movies', 
      label: 'Movies', 
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4z" opacity="0.35" /><path d="M4 6l4 3V6m0 3l4-3m-4 3l4 3m-4-3l-4 3m12-3l4-3m-4 3l4 3m-4-3l-4 3" /></svg> 
    },
    {
      to: '/videos',
      label: 'Videos',
      startsWith: true,
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h11a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zm16 3l-4 2.5v1L20 15V9z" /></svg>
    },
    {
      to: '/platforms',
      label: 'Platforms',
      startsWith: true,
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M4 20h16v-2H4v2zm1-3h4V7H5v10zm5 0h4V4h-4v13zm5 0h4V10h-4v7z" /></svg>
    },
    ...(user ? [{
      to: '/watchlist',
      label: 'Watchlist',
      icon: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h10a2 2 0 012 2v16l-7-4-7 4V6a2 2 0 012-2z" /></svg>
    }] : [])
  ];

  return (
    <nav className="bottom-nav fixed bottom-4 left-0 right-0 z-50 md:hidden px-[5%]">
      <div className="mx-auto max-w-md">
        <div className="bottom-nav-inner rounded-2xl bg-[#111827] border border-white/10 px-3 flex items-center justify-between gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.45)]">
          {navItems.map((item) => {
            const active = isActive(item.to, item.startsWith);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-all duration-200 ${
                  active ? 'bg-white/10 text-white' : 'text-white/60'
                }`}
              >
                <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-300'}`}>
                  {item.icon}
                </span>
                <span className="text-[10px] font-medium whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;


