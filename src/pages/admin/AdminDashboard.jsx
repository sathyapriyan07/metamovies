import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    movies: 0,
    series: 0,
    persons: 0,
    users: 0,
    banners: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const [openSection, setOpenSection] = useState('content');

  const sections = useMemo(() => ([
    {
      id: 'content',
      title: 'Content Management',
      items: [
        { to: '/admin/add-movie', label: 'Add Movie' },
        { to: '/admin/add-series', label: 'Add Series' },
        { to: '/admin/manage-movies', label: 'Manage Movies' },
        { to: '/admin/manage-series', label: 'Manage Series' },
        { to: '/admin/tmdb-import', label: 'TMDB Import' },
        { to: '/admin/manage-hero-banner', label: 'Hero Banner' }
      ]
    },
    {
      id: 'people',
      title: 'People & Crew',
      items: [
        { to: '/admin/add-person', label: 'Add Person' },
        { to: '/admin/manage-persons', label: 'Manage Persons' },
        { to: '/admin/manage-crew', label: 'Manage Crew' }
      ]
    },
    {
      id: 'collections',
      title: 'Collections & Links',
      items: [
        { to: '/admin/manage-collections', label: 'Manage Collections' },
        { to: '/admin/manage-links', label: 'Manage Links' }
      ]
    },
    {
      id: 'system',
      title: 'System / Users',
      items: [
        { to: '/admin/manage-users', label: 'Manage Users' },
        { to: '/admin/manage-avatars', label: 'Manage Avatars' }
      ]
    }
  ]), []);

  const loadStats = async () => {
    const [movies, series, persons, users, banners] = await Promise.all([
      supabase.from('movies').select('id', { count: 'exact', head: true }),
      supabase.from('series').select('id', { count: 'exact', head: true }),
      supabase.from('persons').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('hero_banners').select('id', { count: 'exact', head: true })
    ]);

    setStats({
      movies: movies.count || 0,
      series: series.count || 0,
      persons: persons.count || 0,
      users: users.count || 0,
      banners: banners.count || 0
    });
  };

  return (
    <>
      <div className="md:hidden min-h-screen pb-28">
        <div className="sticky top-0 z-40 glass-nav px-4 py-3">
          <h1 className="text-base font-semibold">Admin Dashboard</h1>
        </div>

        <div className="px-4 pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-4 rounded-2xl">
              <p className="text-xs text-gray-400">Movies</p>
              <p className="text-2xl font-semibold mt-1">{stats.movies}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <p className="text-xs text-gray-400">Series</p>
              <p className="text-2xl font-semibold mt-1">{stats.series}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <p className="text-xs text-gray-400">Persons</p>
              <p className="text-2xl font-semibold mt-1">{stats.persons}</p>
            </div>
            <div className="glass-card p-4 rounded-2xl">
              <p className="text-xs text-gray-400">Hero Banners</p>
              <p className="text-2xl font-semibold mt-1">{stats.banners}</p>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.id} className="glass-card rounded-2xl overflow-hidden border border-white/10">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === section.id ? '' : section.id)}
                className="w-full flex items-center justify-between px-4 h-12"
              >
                <span className="text-sm font-semibold text-gray-100">{section.title}</span>
                <svg
                  className={`w-4 h-4 text-sky-300 transition-transform ${openSection === section.id ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </button>
              {openSection === section.id && (
                <div className="px-3 pb-3 space-y-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center justify-between h-12 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/10"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-100">
                        <span className="w-2 h-2 rounded-full bg-sky-300/70" />
                        {item.label}
                      </span>
                      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="glass-card rounded-2xl p-4">
            <h2 className="text-sm font-semibold mb-2">Update Persons</h2>
            <p className="text-xs text-gray-400 mb-4">
              Fetch full cast and crew details from TMDB.
            </p>
            <div className="flex justify-center">
              <Link to="/admin/update-persons" className="btn-primary shadow-none h-12 px-6 rounded-full text-sm">
                Update Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <AdminLayout title="Dashboard" subtitle="Quick overview of your content library.">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl">
              <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Movies</h3>
              <p className="text-3xl font-semibold mt-2">{stats.movies}</p>
            </div>
            <div className="glass-card p-5 rounded-2xl">
              <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Series</h3>
              <p className="text-3xl font-semibold mt-2">{stats.series}</p>
            </div>
            <div className="glass-card p-5 rounded-2xl">
              <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Persons</h3>
              <p className="text-3xl font-semibold mt-2">{stats.persons}</p>
            </div>
            <div className="glass-card p-5 rounded-2xl">
              <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Hero Banners</h3>
              <p className="text-3xl font-semibold mt-2">{stats.banners}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/admin/add-movie" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Add Movie</h3>
                <p className="text-gray-400 text-sm">Add a new movie to the database</p>
              </Link>
              <Link to="/admin/add-series" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Add Series</h3>
                <p className="text-gray-400 text-sm">Add a new TV series</p>
              </Link>
              <Link to="/admin/add-person" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Add Person</h3>
                <p className="text-gray-400 text-sm">Add cast or crew member</p>
              </Link>
              <Link to="/admin/tmdb-import" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">TMDB Import</h3>
                <p className="text-gray-400 text-sm">Import from TMDB database</p>
              </Link>
              <Link to="/admin/manage-movies" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Manage Movies</h3>
                <p className="text-gray-400 text-sm">Edit or delete movies</p>
              </Link>
              <Link to="/admin/manage-series" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Manage Series</h3>
                <p className="text-gray-400 text-sm">Edit or delete series</p>
              </Link>
              <Link to="/admin/manage-collections" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Manage Collections</h3>
                <p className="text-gray-400 text-sm">Create custom home sections</p>
              </Link>
              <Link to="/admin/update-persons" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Update Persons</h3>
                <p className="text-gray-400 text-sm">Fetch full cast/crew details</p>
              </Link>
              <Link to="/admin/manage-links" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Manage Links</h3>
                <p className="text-gray-400 text-sm">Add trailer and music links</p>
              </Link>
              <Link to="/admin/manage-persons" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Manage Persons</h3>
                <p className="text-gray-400 text-sm">Edit persons and add images</p>
              </Link>
              <Link to="/admin/manage-crew" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Manage Crew</h3>
                <p className="text-gray-400 text-sm">Add directors and composers</p>
              </Link>
              <Link to="/admin/manage-hero-banner" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Hero Banner</h3>
                <p className="text-gray-400 text-sm">Control homepage hero section</p>
              </Link>
              <Link to="/admin/manage-users" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
                <p className="text-gray-400 text-sm">Approve and manage user accounts</p>
              </Link>
              <Link to="/admin/manage-avatars" className="glass-card p-5 rounded-2xl hover:bg-white/5 transition">
                <h3 className="text-lg font-semibold mb-2">Manage Avatars</h3>
                <p className="text-gray-400 text-sm">Add avatar options</p>
              </Link>
            </div>
          </div>
        </AdminLayout>
      </div>
    </>
  );
};

export default AdminDashboard;
