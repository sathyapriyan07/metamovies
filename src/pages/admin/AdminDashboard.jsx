import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    movies: 0,
    videos: 0,
    news: 0,
    persons: 0,
    users: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [movies, videos, news, persons, users] = await Promise.all([
      supabase.from('movies').select('id', { count: 'exact', head: true }),
      supabase.from('videos').select('id', { count: 'exact', head: true }),
      supabase.from('news').select('id', { count: 'exact', head: true }),
      supabase.from('persons').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true })
    ]);

    setStats({
      movies: movies.count || 0,
      videos: videos.count || 0,
      news: news.count || 0,
      persons: persons.count || 0,
      users: users.count || 0
    });
  };

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Quick overview of your content library.">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition">
            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Movies</h3>
            <p className="text-3xl font-semibold mt-2">{stats.movies}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition">
            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Videos</h3>
            <p className="text-3xl font-semibold mt-2">{stats.videos}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition">
            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">News</h3>
            <p className="text-3xl font-semibold mt-2">{stats.news}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition">
            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Persons</h3>
            <p className="text-3xl font-semibold mt-2">{stats.persons}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl hover:scale-[1.02] transition">
            <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Users</h3>
            <p className="text-3xl font-semibold mt-2">{stats.users}</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/admin/add-movie" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Add Movie</h3>
              <p className="text-gray-400 text-sm">Add a new movie to the database</p>
            </Link>
            <Link to="/admin/add-video" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Add Video</h3>
              <p className="text-gray-400 text-sm">Add a featured YouTube video</p>
            </Link>
            <Link to="/admin/add-news" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Add News</h3>
              <p className="text-gray-400 text-sm">Publish a news article</p>
            </Link>
            <Link to="/admin/add-person" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Add Person</h3>
              <p className="text-gray-400 text-sm">Add cast or crew member</p>
            </Link>
            <Link to="/admin/tmdb-import" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">TMDB Import</h3>
              <p className="text-gray-400 text-sm">Import from TMDB database</p>
            </Link>
            <Link to="/admin/manage-movies" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Movies</h3>
              <p className="text-gray-400 text-sm">Edit or delete movies</p>
            </Link>
            <Link to="/admin/videos" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage Videos</h3>
              <p className="text-gray-400 text-sm">Edit or delete videos</p>
            </Link>
            <Link to="/admin/news" className="glass-card p-5 rounded-2xl hover:bg-white/5 hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold mb-2">Manage News</h3>
              <p className="text-gray-400 text-sm">Edit or delete news articles</p>
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
              <p className="text-gray-400 text-sm">Add trailer and streaming links</p>
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
