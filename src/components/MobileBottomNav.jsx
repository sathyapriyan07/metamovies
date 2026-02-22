import { Link, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const items = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    { to: '/platforms', label: 'Platforms' },
    { to: '/search', label: 'Search' },
    { to: '/profile', label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-black/95 border-t border-white/10 lg:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-sm">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`transition ${isActive(item.to) ? 'text-white' : 'text-gray-400'}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
