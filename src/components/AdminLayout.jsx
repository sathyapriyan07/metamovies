import { Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ title, subtitle, children }) => {
  const location = useLocation();
  const items = [
    { label: 'Dashboard', to: '/admin' },
    { label: 'TMDB Import', to: '/admin/tmdb-import' },
    { label: 'Add Movie', to: '/admin/add-movie' },
    { label: 'Add Person', to: '/admin/add-person' },
    { label: 'Add Video', to: '/admin/add-video' },
    { label: 'Add News', to: '/admin/add-news' },
    { label: 'Manage Movies', to: '/admin/manage-movies' },
    { label: 'Manage Videos', to: '/admin/videos' },
    { label: 'Manage News', to: '/admin/news' },
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
    <div className="admin-card">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      <div className="tab-container admin-tabs" style={{ marginTop: 12, marginBottom: 16 }}>
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`tab ${location.pathname === item.to ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default AdminLayout;
