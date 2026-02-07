import { useEffect, useState } from 'react';
import { getMovies, getSeries, updateMovie, updateSeries } from '../../services/supabase';

const ManageLinks = () => {
  const [type, setType] = useState('movie');
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    trailer_url: '',
    spotify: '',
    apple_music: '',
    youtube_music: ''
  });

  useEffect(() => {
    loadItems();
  }, [type]);

  const loadItems = async () => {
    setLoading(true);
    const { data } = type === 'movie' ? await getMovies(100, 0) : await getSeries(100, 0);
    setItems(data || []);
    setLoading(false);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFormData({
      trailer_url: item.trailer_url || '',
      spotify: item.music_links?.spotify || '',
      apple_music: item.music_links?.apple_music || '',
      youtube_music: item.music_links?.youtube_music || ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const updateData = {
      trailer_url: formData.trailer_url,
      music_links: {
        spotify: formData.spotify || null,
        apple_music: formData.apple_music || null,
        youtube_music: formData.youtube_music || null
      }
    };

    if (type === 'movie') {
      await updateMovie(selectedItem.id, updateData);
    } else {
      await updateSeries(selectedItem.id, updateData);
    }

    alert('Links updated successfully!');
    loadItems();
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Manage Trailer & Music Links</h1>

        <div className="mb-6">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-2 bg-white/10 rounded-lg border border-white/20"
          >
            <option value="movie" className="bg-black">Movies</option>
            <option value="series" className="bg-black">Series</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Items List */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Select {type === 'movie' ? 'Movie' : 'Series'}</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div>Loading...</div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`glass-dark p-4 rounded-lg cursor-pointer hover:bg-white/20 transition ${
                      selectedItem?.id === item.id ? 'border-2 border-red-600' : ''
                    }`}
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-gray-400">
                      {item.trailer_url ? '✓ Trailer' : '✗ Trailer'} | 
                      {item.music_links?.spotify || item.music_links?.apple_music || item.music_links?.youtube_music ? ' ✓ Music' : ' ✗ Music'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div>
            {selectedItem ? (
              <div className="glass-dark p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{selectedItem.title}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Trailer URL (YouTube)</label>
                    <input
                      type="url"
                      value={formData.trailer_url}
                      onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Spotify Link</label>
                    <input
                      type="url"
                      value={formData.spotify}
                      onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                      placeholder="https://open.spotify.com/..."
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Apple Music Link</label>
                    <input
                      type="url"
                      value={formData.apple_music}
                      onChange={(e) => setFormData({ ...formData, apple_music: e.target.value })}
                      placeholder="https://music.apple.com/..."
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">YouTube Music Link</label>
                    <input
                      type="url"
                      value={formData.youtube_music}
                      onChange={(e) => setFormData({ ...formData, youtube_music: e.target.value })}
                      placeholder="https://music.youtube.com/..."
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                    />
                  </div>

                  <button type="submit" className="w-full btn-primary py-3">
                    Update Links
                  </button>
                </form>
              </div>
            ) : (
              <div className="glass-dark p-6 rounded-xl text-center text-gray-400">
                Select a {type} to edit links
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLinks;
