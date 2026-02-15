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
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" /></svg> 
    },
    { 
      to: '/movies', 
      label: 'Movies', 
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v12H4z" opacity="0.35" /><path d="M4 6l4 3V6m0 3l4-3m-4 3l4 3m-4-3l-4 3m12-3l4-3m-4 3l4 3m-4-3l-4 3" /></svg> 
    },
    {
      to: '/videos',
      label: 'Videos',
      startsWith: true,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h11a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2zm16 3l-4 2.5v1L20 15V9z" /></svg>
    },
    {
      to: '/platforms',
      label: 'Platforms',
      startsWith: true,
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M4 20h16v-2H4v2zm1-3h4V7H5v10zm5 0h4V4h-4v13zm5 0h4V10h-4v7z" /></svg>
    },
    ...(user ? [{
      to: '/watchlist',
      label: 'Watchlist',
      icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h10a2 2 0 012 2v16l-7-4-7 4V6a2 2 0 012-2z" /></svg>
    }] : [])
  ];

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 md:hidden px-[5%]">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-center gap-3 h-16 px-4 rounded-full bg-[rgba(10,15,25,0.85)] backdrop-blur-[20px] shadow-[0_10px_40px_rgba(59,167,255,0.15)]">
          {navItems.map((item) => {
            const active = isActive(item.to, item.startsWith);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={`flex items-center justify-center rounded-full transition-all duration-300 ease-out ${
                  active
                    ? 'w-[120px] h-10 px-4 bg-gradient-to-br from-[rgba(59,167,255,0.25)] to-[rgba(59,167,255,0.08)]'
                    : 'w-10 h-10 bg-white/[0.06] hover:bg-white/[0.12]'
                }`}
              >
                <span className={`flex-shrink-0 ${active ? 'text-white' : 'text-slate-300'}`}>
                  {item.icon}
                </span>
                {active && (
                  <span className="ml-2 text-sm font-medium text-white whitespace-nowrap animate-in slide-in-from-left-2 fade-in duration-200">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
