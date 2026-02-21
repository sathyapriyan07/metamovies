import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const ManageHeroBanner = () => {
  const [banners, setBanners] = useState([]);
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [editingBanner, setEditingBanner] = useState(null);

  useEffect(() => {
    loadBanners();
    loadContent();
  }, []);

  const loadBanners = async () => {
    const { data } = await supabase
      .from('hero_banners')
      .select(`
        *,
        movie:movies(*)
      `)
      .order('display_order', { ascending: true });
    setBanners(data || []);
  };

  const loadContent = async () => {
    const [moviesData] = await Promise.all([
      supabase.from('movies').select('*').order('created_at', { ascending: false })
    ]);
    setMovies(moviesData.data || []);
  };

  const handleSearch = () => {
    const content = movies;
    const filtered = content.filter(item =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleAddBanner = async (itemId) => {
    const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.display_order || 0)) : 0;
    await supabase.from('hero_banners').insert({
      movie_id: itemId,
            display_order: maxOrder + 1,
      is_active: true
    });
    loadBanners();
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleToggleActive = async (id, currentStatus) => {
    await supabase
      .from('hero_banners')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    loadBanners();
  };

  const handleUpdateOrder = async (id, newOrder) => {
    await supabase
      .from('hero_banners')
      .update({ display_order: parseInt(newOrder) })
      .eq('id', id);
    loadBanners();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this hero banner?')) {
      await supabase.from('hero_banners').delete().eq('id', id);
      loadBanners();
    }
  };

  return (
    <AdminLayout title="Hero Banner" subtitle="Curate the hero carousel content.">
      <div className="glass-card rounded-2xl p-6">

        <div className="grid md:grid-cols-2 gap-8">
          {/* Add Banner */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Add New Banner</h2>
            <div className="glass-dark p-6 rounded-xl">
              <div className="flex gap-2 mb-4">
                                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 px-4 py-2 bg-white/10 rounded-lg border border-white/20"
                />
                <button onClick={handleSearch} className="btn-secondary">Search</button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-white/5 rounded-lg">
                      <img
                        src={item.poster_url || 'https://via.placeholder.com/50x75'}
                        alt={item.title}
                        className="w-12 h-18 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-xs text-gray-400">
                          {item.release_date?.split('-')[0]} - {item.genres?.[0]}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddBanner(item.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Current Banners */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Current Banners ({banners.length})</h2>
            <div className="space-y-3">
              {banners.map((banner) => {
                const content = banner.movie;
                return (
                  <div key={banner.id} className="glass-dark p-4 rounded-xl">
                    <div className="flex gap-3 mb-3">
                      <img
                        src={content?.poster_url || 'https://via.placeholder.com/60x90'}
                        alt={content?.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-bold">{content?.title}</p>
                        <p className="text-sm text-gray-400">
                          Movie
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {content?.release_date?.split('-')[0]} - ⭐ {content?.rating?.toFixed(1)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <label className="text-sm text-gray-400">Order:</label>
                      <input
                        type="number"
                        value={banner.display_order || 0}
                        onChange={(e) => handleUpdateOrder(banner.id, e.target.value)}
                        className="w-20 px-2 py-1 bg-white/10 rounded border border-white/20 text-sm"
                      />
                      <button
                        onClick={() => handleToggleActive(banner.id, banner.is_active)}
                        className={`px-3 py-1 rounded text-sm ${
                          banner.is_active
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                      >
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm ml-auto"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
              {banners.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                  No hero banners yet. Add one to get started.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageHeroBanner;


