import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const SidebarNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const items = [
    { to: '/', label: 'Home' },
    { to: '/movies', label: 'Movies' },
    { to: '/platforms', label: 'Platforms' },
    { to: '/videos', label: 'Videos', startsWith: true },
    { to: '/news', label: 'News', startsWith: true },
    { to: '/search', label: 'Search' },
    ...(user ? [{ to: '/watchlist', label: 'Watchlist' }] : []),
    ...(user ? [{ to: '/profile', label: 'Profile' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', startsWith: true }] : [])
  ];

  const isActive = (item) => (
    item.startsWith ? location.pathname.startsWith(item.to) : location.pathname === item.to
  );

  return (
    <aside className="ott-sidebar">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="ott-sidebar-brand text-white"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white font-semibold">
          M
        </span>
        <span>MetaMovies</span>
      </button>

      <nav className="ott-nav">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`ott-nav-item ${isActive(item) ? 'ott-nav-item-active' : ''}`}
          >
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
        <Avatar
          src={user?.user_metadata?.avatar_url}
          name={user?.user_metadata?.username || user?.email || 'Guest'}
          size="md"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{user?.user_metadata?.username || 'Guest'}</p>
          <p className="text-xs text-muted truncate">{user?.email || 'Sign in to personalize'}</p>
        </div>
      </div>
    </aside>
  );
};

export default SidebarNav;
