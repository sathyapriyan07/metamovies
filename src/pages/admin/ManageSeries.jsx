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
      </div>
    </AdminLayout>
  );
};

export default ManageSeries;
