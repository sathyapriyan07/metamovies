import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    movies: 0,
    series: 0,
    persons: 0,
    users: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [movies, series, persons, users] = await Promise.all([
      supabase.from('movies').select('id', { count: 'exact', head: true }),
      supabase.from('series').select('id', { count: 'exact', head: true }),
      supabase.from('persons').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true })
    ]);

    setStats({
      movies: movies.count || 0,
      series: series.count || 0,
      persons: persons.count || 0,
      users: users.count || 0
    });
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-dark p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm mb-2">Total Movies</h3>
            <p className="text-3xl font-bold">{stats.movies}</p>
          </div>
          <div className="glass-dark p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm mb-2">Total Series</h3>
            <p className="text-3xl font-bold">{stats.series}</p>
          </div>
          <div className="glass-dark p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm mb-2">Total Persons</h3>
            <p className="text-3xl font-bold">{stats.persons}</p>
          </div>
          <div className="glass-dark p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{stats.users}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/add-movie" className="glass-dark p-6 rounded-xl hover:bg-white/20 transition">
            <h3 className="text-xl font-bold mb-2">🎬 Add Movie</h3>
            <p className="text-gray-400 text-sm">Add a new movie to the database</p>
          </Link>
          <Link to="/admin/add-series" className="glass-dark p-6 rounded-xl hover:bg-white/20 transition">
            <h3 className="text-xl font-bold mb-2">📺 Add Series</h3>
            <p className="text-gray-400 text-sm">Add a new TV series</p>
          </Link>
          <Link to="/admin/add-person" className="glass-dark p-6 rounded-xl hover:bg-white/20 transition">
            <h3 className="text-xl font-bold mb-2">👤 Add Person</h3>
            <p className="text-gray-400 text-sm">Add cast or crew member</p>
          </Link>
          <Link to="/admin/tmdb-import" className="glass-dark p-6 rounded-xl hover:bg-white/20 transition">
            <h3 className="text-xl font-bold mb-2">📥 TMDB Import</h3>
            <p className="text-gray-400 text-sm">Import from TMDB database</p>
          </Link>
          <Link to="/admin/manage-movies" className="glass-dark p-6 rounded-xl hover:bg-white/20 transition">
            <h3 className="text-xl font-bold mb-2">✏️ Manage Movies</h3>
            <p className="text-gray-400 text-sm">Edit or delete movies</p>
          </Link>
          <Link to="/admin/manage-series" className="glass-dark p-6 rounded-xl hover:bg-white/20 transition">
            <h3 className="text-xl font-bold mb-2">✏️ Manage Series</h3>
            <p className="text-gray-400 text-sm">Edit or delete series</p>
          </Link>
          <Link to="/admin/manage-collections" className="glass-dark p-6 rounded-xl hover:bg-white/20 transition">
            <h3 className="text-xl font-bold mb-2">📂 Manage Collections</h3>
            <p className="text-gray-400 text-sm">Create custom home sections</p>
          </Link>
          <Link to="/admin/update-persons" className="glass-dark p-6 rounded-xl hover:bg-white/20 transition">
            <h3 className="text-xl font-bold mb-2">🔄 Update Persons</h3>
            <p className="text-gray-400 text-sm">Fetch full cast/crew details</p>
          </Link>
          <Link to="/admin/manage-links" className="glass-dark p-6 rounded-xl hover:bg-white/20 transition">
            <h3 className="text-xl font-bold mb-2">🔗 Manage Links</h3>
            <p className="text-gray-400 text-sm">Add trailer & music links</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
