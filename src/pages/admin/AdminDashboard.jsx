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
      <div className="px-4 pt-6 space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-4">Stats</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4">
              <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Movies</h3>
              <p className="text-2xl font-semibold mt-2">{stats.movies}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4">
              <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Videos</h3>
              <p className="text-2xl font-semibold mt-2">{stats.videos}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4">
              <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">News</h3>
              <p className="text-2xl font-semibold mt-2">{stats.news}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4">
              <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Persons</h3>
              <p className="text-2xl font-semibold mt-2">{stats.persons}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4">
              <h3 className="text-gray-400 text-xs uppercase tracking-[0.2em]">Users</h3>
              <p className="text-2xl font-semibold mt-2">{stats.users}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/admin/add-movie" className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 hover:bg-[#222] transition">
              <h3 className="text-base font-semibold mb-2">Add Movie</h3>
              <p className="text-gray-400 text-sm">Add a new movie to the database</p>
            </Link>
            <Link to="/admin/add-video" className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 hover:bg-[#222] transition">
              <h3 className="text-base font-semibold mb-2">Add Video</h3>
              <p className="text-gray-400 text-sm">Add a featured YouTube video</p>
            </Link>
            <Link to="/admin/add-news" className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 hover:bg-[#222] transition">
              <h3 className="text-base font-semibold mb-2">Add News</h3>
              <p className="text-gray-400 text-sm">Publish a news article</p>
            </Link>
            <Link to="/admin/add-person" className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 hover:bg-[#222] transition">
              <h3 className="text-base font-semibold mb-2">Add Person</h3>
              <p className="text-gray-400 text-sm">Add cast or crew member</p>
            </Link>
            <Link to="/admin/tmdb-import" className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 hover:bg-[#222] transition">
              <h3 className="text-base font-semibold mb-2">TMDB Import</h3>
              <p className="text-gray-400 text-sm">Import from TMDB database</p>
            </Link>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;


