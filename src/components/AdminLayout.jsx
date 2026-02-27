import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ title, subtitle, children }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const items = [
    { label: 'Dashboard', to: '/admin' },
    { label: 'TMDB Import', to: '/admin/tmdb-import' },
    { label: 'Add Movie', to: '/admin/add-movie' },
    { label: 'Add Person', to: '/admin/add-person' },
    { label: 'Add Video', to: '/admin/add-video' },
    { label: 'Add News', to: '/admin/add-news' },
    { label: 'Manage Movies', to: '/admin/manage-movies' },
    { label: 'Manage Series', to: '/admin/manage-series' },
    { label: 'Manage Videos', to: '/admin/videos' },
    { label: 'Manage News', to: '/admin/news' },
    { label: 'Manage Collections', to: '/admin/manage-collections' },
    { label: 'Update Persons', to: '/admin/update-persons' },
    { label: 'Manage Links', to: '/admin/manage-links' },
    { label: 'Manage Persons', to: '/admin/manage-persons' },
    { label: 'Manage Crew', to: '/admin/manage-crew' },
    { label: 'Manage Platforms', to: '/admin/manage-platforms' },
    { label: 'Music', to: '/admin/soundtracks' },
    { label: 'Releases', to: '/admin/releases' },
    { label: 'Reviews', to: '/admin/reviews' },
    { label: 'Trending', to: '/admin/trending' },
    { label: 'Deezer Import', to: '/admin/deezer-import' },
    { label: 'SEO', to: '/admin/seo' },
    { label: 'Hero Banner', to: '/admin/manage-hero-banner' },
    { label: 'Manage Users', to: '/admin/manage-users' },
    { label: 'Manage Avatars', to: '/admin/manage-avatars' }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pt-12 pb-10">
      <div className="max-w-2xl lg:max-w-6xl mx-auto px-4">
        <div className="lg:flex lg:gap-6">
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4">
              <div className="text-xs uppercase text-gray-400 mb-3">Admin</div>
              <nav className="flex flex-col gap-2">
                {items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`text-sm px-3 py-2 rounded-md border border-transparent ${
                      location.pathname === item.to
                        ? 'bg-[#2a2a2a] text-white border-gray-800'
                        : 'text-gray-300 hover:text-white hover:bg-[#2a2a2a]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-lg font-semibold">{title}</h1>
                {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
              </div>
              <button
                className="lg:hidden text-sm text-gray-300 border border-gray-800 rounded-md px-3 py-2"
                onClick={() => setMenuOpen(true)}
              >
                Menu
              </button>
            </div>
            <div>{children}</div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <button
            className="absolute inset-0 bg-black/70"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[#111] border-r border-gray-800 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[#F5C518] font-semibold text-sm">Admin Menu</div>
              <button
                className="text-white/80"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                Close
              </button>
            </div>
            <nav className="flex flex-col gap-2">
              {items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`text-sm px-3 py-2 rounded-md border border-transparent ${
                    location.pathname === item.to
                      ? 'bg-[#2a2a2a] text-white border-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
