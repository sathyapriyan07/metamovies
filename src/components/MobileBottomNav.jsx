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
    <nav className="mobile-nav">
      {items.map((item) => (
        <Link key={item.to} to={item.to} style={{ color: isActive(item.to) ? '#ffffff' : '#9ca3af' }}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
