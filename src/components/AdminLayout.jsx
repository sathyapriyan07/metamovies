import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const AdminLayout = ({ title, subtitle, children }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = [
    { label: 'Dashboard', to: '/admin' },
    { label: 'TMDB Import', to: '/admin/tmdb-import' },
    { label: 'Add Movie', to: '/admin/add-movie' },    { label: 'Add Person', to: '/admin/add-person' },
    { label: 'Manage Movies', to: '/admin/manage-movies' },    { label: 'Manage Collections', to: '/admin/manage-collections' },
    { label: 'Update Persons', to: '/admin/update-persons' },
    { label: 'Manage Links', to: '/admin/manage-links' },
    { label: 'Manage Persons', to: '/admin/manage-persons' },
    { label: 'Manage Crew', to: '/admin/manage-crew' },
    { label: 'Hero Banner', to: '/admin/manage-hero-banner' },
    { label: 'Manage Users', to: '/admin/manage-users' },
    { label: 'Manage Avatars', to: '/admin/manage-avatars' }
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <div className="sticky top-0 z-40 glass-nav">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div>
            <p className="text-sky-300 text-[11px] uppercase tracking-[0.3em]">Admin</p>
            <h1 className="text-base md:text-lg font-semibold text-white">{title}</h1>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="px-3 py-2 rounded-full text-sm font-medium bg-white/10 hover:bg-white/20 transition border border-white/10"
              aria-label="Admin menu"
            >
              Admin Menu
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2 shadow-xl">
                {items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 rounded-xl text-sm font-medium transition ${
                      location.pathname === item.to
                        ? 'bg-sky-400/20 text-sky-200'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        {subtitle && <p className="text-gray-400 mb-6">{subtitle}</p>}
        <section className="space-y-6">{children}</section>
      </div>
    </div>
  );
};

export default AdminLayout;
