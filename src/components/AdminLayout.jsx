import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const AdminLayout = ({ title, subtitle, children }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = [
    { label: 'Dashboard', to: '/admin' },
    { label: 'TMDB Import', to: '/admin/tmdb-import' },
    { label: 'Music Import', to: '/admin/music-import' },
    { label: 'Add Movie', to: '/admin/add-movie' },
    { label: 'Add Music', to: '/admin/add-music' },
    { label: 'Add Person', to: '/admin/add-person' },
    { label: 'Manage Movies', to: '/admin/manage-movies' },
    { label: 'Manage Music', to: '/admin/manage-music' },
    { label: 'Manage Artists', to: '/admin/manage-artists' },
    { label: 'Manage Albums', to: '/admin/manage-albums' },
    { label: 'Manage Tracks', to: '/admin/manage-tracks' },
    { label: 'Manage Collections', to: '/admin/manage-collections' },
    { label: 'Update Persons', to: '/admin/update-persons' },
    { label: 'Manage Links', to: '/admin/manage-links' },
    { label: 'Manage Persons', to: '/admin/manage-persons' },
    { label: 'Manage Crew', to: '/admin/manage-crew' },
    { label: 'Manage Platforms', to: '/admin/manage-platforms' },
    { label: 'Hero Banner', to: '/admin/manage-hero-banner' },
    { label: 'Manage Users', to: '/admin/manage-users' },
    { label: 'Manage Avatars', to: '/admin/manage-avatars' }
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <div className="mx-auto px-4 md:px-8 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/60 text-[11px] uppercase tracking-[0.3em]">Admin</p>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            {subtitle && <p className="text-muted mt-2">{subtitle}</p>}
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="px-3 py-2 rounded-full text-sm font-medium btn-ghost"
              aria-label="Admin menu"
            >
              Admin Menu
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2">
                {items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 rounded-xl text-sm font-medium transition ${
                      location.pathname === item.to
                        ? 'bg-white/12 text-white'
                        : 'text-gray-300 hover:bg-white/8'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <section className="space-y-6">{children}</section>
      </div>
    </div>
  );
};

export default AdminLayout;


