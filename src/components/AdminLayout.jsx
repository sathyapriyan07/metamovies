import { Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ title, subtitle, children }) => {
  const location = useLocation();
  const items = [
    { label: 'Dashboard', to: '/admin' },
    { label: 'TMDB Import', to: '/admin/tmdb-import' },
    { label: 'Add Movie', to: '/admin/add-movie' },
    { label: 'Add Series', to: '/admin/add-series' },
    { label: 'Add Person', to: '/admin/add-person' },
    { label: 'Manage Movies', to: '/admin/manage-movies' },
    { label: 'Manage Series', to: '/admin/manage-series' },
    { label: 'Manage Collections', to: '/admin/manage-collections' },
    { label: 'Update Persons', to: '/admin/update-persons' },
    { label: 'Manage Links', to: '/admin/manage-links' },
    { label: 'Manage Persons', to: '/admin/manage-persons' },
    { label: 'Manage Crew', to: '/admin/manage-crew' },
    { label: 'Hero Banner', to: '/admin/manage-hero-banner' },
    { label: 'Manage Users', to: '/admin/manage-users' },
    { label: 'Manage Avatars', to: '/admin/manage-avatars' }
  ];

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-6">
          <p className="text-sky-300 text-xs uppercase tracking-[0.3em]">Admin</p>
          <h1 className="text-3xl md:text-5xl font-semibold mt-2">{title}</h1>
          {subtitle && <p className="text-gray-400 mt-2">{subtitle}</p>}
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-6">
          <aside className="glass-card rounded-2xl p-4 h-fit sticky top-24">
            <div className="space-y-2">
              {items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`block px-3 py-2 rounded-xl text-sm font-medium transition ${
                    location.pathname === item.to
                      ? 'bg-sky-400/20 text-sky-200 border border-sky-300/40'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </aside>

          <section className="space-y-6">{children}</section>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
