import { useEffect, useState } from 'react';
import { getMovies, updateMovie } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const ManageLinks = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    trailer_url: '',
    spotify: '',
    apple_music: '',
    youtube_music: '',
    amazon_music: '',
    telegram_link: '',
    netflix: '',
    prime: '',
    hotstar: '',
    zee5: '',
    composer_name: '',
    composer_spotify: '',
    composer_apple_music: '',
    composer_youtube_music: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const { data } = await getMovies(null, 0);
    setItems(data || []);
    setFilteredItems(data || []);
    setSearchQuery('');
    setLoading(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFormData({
      trailer_url: item.trailer_url || '',
      spotify: item.music_links?.spotify || '',
      apple_music: item.music_links?.apple_music || '',
      youtube_music: item.music_links?.youtube_music || '',
      amazon_music: item.music_links?.amazon_music || '',
      telegram_link: item.telegram_link || '',
      netflix: item.watch_links?.netflix || '',
      prime: item.watch_links?.prime || '',
      hotstar: item.watch_links?.hotstar || '',
      zee5: item.watch_links?.zee5 || '',
      composer_name: item.composer_name || '',
      composer_spotify: item.composer_links?.spotify || '',
      composer_apple_music: item.composer_links?.apple_music || '',
      composer_youtube_music: item.composer_links?.youtube_music || ''
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
        youtube_music: formData.youtube_music || null,
        amazon_music: formData.amazon_music || null
      },
      telegram_link: formData.telegram_link || null,
      watch_links: {
        netflix: formData.netflix || null,
        prime: formData.prime || null,
        hotstar: formData.hotstar || null,
        zee5: formData.zee5 || null
      },
      composer_name: formData.composer_name || null,
      composer_links: {
        spotify: formData.composer_spotify || null,
        apple_music: formData.composer_apple_music || null,
        youtube_music: formData.composer_youtube_music || null
      }
    };

    await updateMovie(selectedItem.id, updateData);

    alert('Links updated successfully!');
    loadItems();
    setSelectedItem(null);
  };

  return (
    <AdminLayout title="Manage Links" subtitle="Configure trailers and music links.">
      <div className="pt-16 pb-20 min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 mt-6">
            <div className="lg:w-1/3 w-full bg-white/5 rounded-2xl p-4 max-h-[70vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Select Movie</h2>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
              />
              <div className="mt-4 space-y-2">
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className={`p-3 rounded-xl cursor-pointer hover:bg-white/10 transition ${
                        selectedItem?.id === item.id ? 'bg-white/10 border border-white/20' : ''
                      }`}
                    >
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-xs text-gray-400">
                        Trailer: {item.trailer_url ? 'Yes' : 'No'} |{' '}
                        Music: {item.music_links?.spotify || item.music_links?.apple_music || item.music_links?.youtube_music ? 'Yes' : 'No'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:w-2/3 w-full bg-white/5 rounded-2xl p-6">
              {selectedItem ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">{selectedItem.title}</h2>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Trailer URL (YouTube)</label>
                      <input
                        type="url"
                        value={formData.trailer_url}
                        onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Spotify Link</label>
                      <input
                        type="url"
                        value={formData.spotify}
                        onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                        placeholder="https://open.spotify.com/..."
                        className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Apple Music Link</label>
                      <input
                        type="url"
                        value={formData.apple_music}
                        onChange={(e) => setFormData({ ...formData, apple_music: e.target.value })}
                        placeholder="https://music.apple.com/..."
                        className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">YouTube Music Link</label>
                      <input
                        type="url"
                        value={formData.youtube_music}
                        onChange={(e) => setFormData({ ...formData, youtube_music: e.target.value })}
                        placeholder="https://music.youtube.com/..."
                        className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Amazon Music Link</label>
                      <input
                        type="url"
                        value={formData.amazon_music}
                        onChange={(e) => setFormData({ ...formData, amazon_music: e.target.value })}
                        placeholder="https://music.amazon.com/..."
                        className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Telegram Download Link</label>
                      <input
                        type="url"
                        value={formData.telegram_link}
                        onChange={(e) => setFormData({ ...formData, telegram_link: e.target.value })}
                        placeholder="https://t.me/..."
                        className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                      />
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <h3 className="text-lg font-semibold mb-3">Watch Now Links (OTT Platforms)</h3>
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Netflix</label>
                          <input
                            type="url"
                            value={formData.netflix}
                            onChange={(e) => setFormData({ ...formData, netflix: e.target.value })}
                            placeholder="https://www.netflix.com/..."
                            className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Prime Video</label>
                          <input
                            type="url"
                            value={formData.prime}
                            onChange={(e) => setFormData({ ...formData, prime: e.target.value })}
                            placeholder="https://www.primevideo.com/..."
                            className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">JioHotstar</label>
                          <input
                            type="url"
                            value={formData.hotstar}
                            onChange={(e) => setFormData({ ...formData, hotstar: e.target.value })}
                            placeholder="https://www.hotstar.com/..."
                            className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">ZEE5</label>
                          <input
                            type="url"
                            value={formData.zee5}
                            onChange={(e) => setFormData({ ...formData, zee5: e.target.value })}
                            placeholder="https://www.zee5.com/..."
                            className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <h3 className="text-lg font-semibold mb-3">Music Composer/Director</h3>
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Composer Name</label>
                          <input
                            type="text"
                            value={formData.composer_name}
                            onChange={(e) => setFormData({ ...formData, composer_name: e.target.value })}
                            placeholder="e.g., A.R. Rahman"
                            className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Composer Spotify</label>
                          <input
                            type="url"
                            value={formData.composer_spotify}
                            onChange={(e) => setFormData({ ...formData, composer_spotify: e.target.value })}
                            placeholder="https://open.spotify.com/artist/..."
                            className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Composer Apple Music</label>
                          <input
                            type="url"
                            value={formData.composer_apple_music}
                            onChange={(e) => setFormData({ ...formData, composer_apple_music: e.target.value })}
                            placeholder="https://music.apple.com/artist/..."
                            className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-400 mb-2">Composer YouTube Music</label>
                          <input
                            type="url"
                            value={formData.composer_youtube_music}
                            onChange={(e) => setFormData({ ...formData, composer_youtube_music: e.target.value })}
                            placeholder="https://music.youtube.com/channel/..."
                            className="w-full bg-white/10 rounded-lg px-4 py-2 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button type="submit" className="w-full btn-primary py-3">
                      Update Links
                    </button>
                  </form>
                </div>
              ) : (
                <div className="rounded-xl text-center text-gray-400 py-12">
                  Select a movie to edit links
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageLinks;
