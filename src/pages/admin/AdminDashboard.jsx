import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    movies: 0,
    music: 0,
    persons: 0,
    users: 0,
    banners: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [movies, music, persons, users, banners] = await Promise.all([
      supabase.from('movies').select('id', { count: 'exact', head: true }),
      supabase.from('music').select('id', { count: 'exact', head: true }),
      supabase.from('persons').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('hero_banners').select('id', { count: 'exact', head: true })
    ]);

    setStats({
      movies: movies.count || 0,
      music: music.count || 0,
      persons: persons.count || 0,
      users: users.count || 0,
      banners: banners.count || 0
    });
  };

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Quick overview of your content library.">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition">
            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Movies</h3>
            <p className="text-3xl font-semibold mt-2">{stats.movies}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition">
            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Music</h3>
            <p className="text-3xl font-semibold mt-2">{stats.music}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition">
            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Persons</h3>
            <p className="text-3xl font-semibold mt-2">{stats.persons}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition">
            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Hero Banners</h3>
            <p className="text-3xl font-semibold mt-2">{stats.banners}</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/admin/add-movie" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Add Movie</h3>
              <p className="text-gray-400 text-sm">Add a new movie to the database</p>
            </Link>
            <Link to="/admin/add-music" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Add Music</h3>
              <p className="text-gray-400 text-sm">Add a new music entry</p>
            </Link>
            <Link to="/admin/add-person" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Add Person</h3>
              <p className="text-gray-400 text-sm">Add cast or crew member</p>
            </Link>
            <Link to="/admin/tmdb-import" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">TMDB Import</h3>
              <p className="text-gray-400 text-sm">Import from TMDB database</p>
            </Link>
            <Link to="/admin/music-import" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Music Import</h3>
              <p className="text-gray-400 text-sm">Import from a music API</p>
            </Link>
            <Link to="/admin/manage-movies" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Movies</h3>
              <p className="text-gray-400 text-sm">Edit or delete movies</p>
            </Link>
            <Link to="/admin/manage-music" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Music</h3>
              <p className="text-gray-400 text-sm">Edit or delete music</p>
            </Link>
            <Link to="/admin/manage-artists" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Artists</h3>
              <p className="text-gray-400 text-sm">Edit artist profiles</p>
            </Link>
            <Link to="/admin/manage-albums" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Albums</h3>
              <p className="text-gray-400 text-sm">Edit album metadata</p>
            </Link>
            <Link to="/admin/manage-tracks" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Tracks</h3>
              <p className="text-gray-400 text-sm">Edit track links</p>
            </Link>
            <Link to="/admin/manage-collections" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Collections</h3>
              <p className="text-gray-400 text-sm">Create custom home sections</p>
            </Link>
            <Link to="/admin/update-persons" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Update Persons</h3>
              <p className="text-gray-400 text-sm">Fetch full cast/crew details</p>
            </Link>
            <Link to="/admin/manage-links" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Links</h3>
              <p className="text-gray-400 text-sm">Add trailer and music links</p>
            </Link>
            <Link to="/admin/manage-persons" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Persons</h3>
              <p className="text-gray-400 text-sm">Edit persons and add images</p>
            </Link>
            <Link to="/admin/manage-crew" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Crew</h3>
              <p className="text-gray-400 text-sm">Add directors and composers</p>
            </Link>
            <Link to="/admin/manage-hero-banner" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Hero Banner</h3>
              <p className="text-gray-400 text-sm">Control homepage hero section</p>
            </Link>
            <Link to="/admin/manage-users" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Users</h3>
              <p className="text-gray-400 text-sm">Approve and manage user accounts</p>
            </Link>
            <Link to="/admin/manage-avatars" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Avatars</h3>
              <p className="text-gray-400 text-sm">Add avatar options</p>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
