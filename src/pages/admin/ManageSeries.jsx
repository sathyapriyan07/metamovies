import { useEffect, useState } from 'react';
import { getSeries, deleteSeries, updateSeries } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const ManageSeries = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState([]);
  const [filteredSeries, setFilteredSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRatings, setEditingRatings] = useState(null);
  const [imdbRating, setImdbRating] = useState('');
  const [rottenRating, setRottenRating] = useState('');

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    setLoading(true);
    const { data } = await getSeries(null, 0);
    setSeries(data || []);
    setFilteredSeries(data || []);
    setLoading(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredSeries(series);
    } else {
      const filtered = series.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSeries(filtered);
    }
  };

  const handleToggleTrending = async (item) => {
    await updateSeries(item.id, { trending: !item.trending });
    loadSeries();
  };

  const handleDelete = async (id, title) => {
    if (confirm(`Delete "${title}"?`)) {
      await deleteSeries(id);
      loadSeries();
    }
  };

  const handleEditRatings = (item) => {
    setEditingRatings(item);
    setImdbRating(item.imdb_rating ?? '');
    setRottenRating(item.rotten_rating ?? '');
  };

  const handleSaveRatings = async () => {
    if (!editingRatings) return;
    await updateSeries(editingRatings.id, {
      imdb_rating: imdbRating === '' ? null : parseFloat(imdbRating),
      rotten_rating: rottenRating === '' ? null : parseInt(rottenRating, 10)
    });
    setEditingRatings(null);
    setImdbRating('');
    setRottenRating('');
    loadSeries();
  };

  return (
    <AdminLayout title="Manage Series" subtitle="Edit or remove existing series.">
      <div className="glass-card rounded-2xl p-6">

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search series..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
          />
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid gap-4">
            {filteredSeries.map((item) => (
              <div key={item.id} className="glass-dark p-4 rounded-xl flex gap-4">
                <img
                  src={item.poster_url || 'https://via.placeholder.com/100x150'}
                  alt={item.title}
                  className="w-16 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.first_air_date?.split('-')[0]}</p>
                  <p className="text-sm text-gray-400 line-clamp-2">{item.overview}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditRatings(item)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm"
                  >
                    Edit Ratings
                  </button>
                  <button
                    onClick={() => handleToggleTrending(item)}
                    className={`px-4 py-2 rounded-lg ${item.trending ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                  >
                    {item.trending ? '⭐ Trending' : 'Set Trending'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {editingRatings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass-dark p-6 rounded-xl max-w-xl w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Ratings - {editingRatings.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <span>IMDb Rating</span>
                  <img
                    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='16' viewBox='0 0 24 16'><rect width='24' height='16' rx='3' fill='%23f5c518'/><text x='12' y='11' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='9' font-weight='700' fill='%23000000'>IMDb</text></svg>"
                    alt="IMDb"
                    className="w-6 h-4"
                    loading="lazy"
                    decoding="async"
                  />
                </label>
                <input
                  type="number"
                  step="0.1"
                  max="10"
                  value={imdbRating}
                  onChange={(e) => setImdbRating(e.target.value)}
                  placeholder="0 - 10"
                  className="w-full px-4 py-3 glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <span>Rotten Tomatoes</span>
                  <img
                    src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24'><path fill='%23e50914' d='M12 2c3 2.5 6 5.5 6 9a6 6 0 1 1-12 0c0-3.5 3-6.5 6-9z'/><circle cx='9' cy='11' r='1.2' fill='%23ffffff'/><circle cx='15' cy='11' r='1.2' fill='%23ffffff'/></svg>"
                    alt="Rotten Tomatoes"
                    className="w-4 h-4"
                    loading="lazy"
                    decoding="async"
                  />
                </label>
                <input
                  type="number"
                  max="100"
                  value={rottenRating}
                  onChange={(e) => setRottenRating(e.target.value)}
                  placeholder="0 - 100"
                  className="w-full px-4 py-3 glass-input"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveRatings} className="flex-1 btn-primary">
                Save Ratings
              </button>
              <button onClick={() => setEditingRatings(null)} className="flex-1 btn-ghost">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default ManageSeries;
