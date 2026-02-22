import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const ManagePersons = () => {
  const [persons, setPersons] = useState([]);
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [formData, setFormData] = useState({ 
    profile_url: '', 
    biography: '',
    spotify: '',
    apple_music: '',
    youtube_music: '',
    amazon_music: ''
  });

  useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = async () => {
    setLoading(true);
    let allPersons = [];
    let from = 0;
    const batchSize = 1000;
    
    while (true) {
      const { data } = await supabase
        .from('persons')
        .select('*')
        .order('name')
        .range(from, from + batchSize - 1);
      
      if (!data || data.length === 0) break;
      allPersons = [...allPersons, ...data];
      if (data.length < batchSize) break;
      from += batchSize;
    }
    
    setPersons(allPersons);
    setFilteredPersons(allPersons);
    setLoading(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredPersons(persons);
    } else {
      const filtered = persons.filter(person => 
        person.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPersons(filtered);
    }
  };

  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
    setFormData({ 
      profile_url: person.profile_url || '',
      biography: person.biography || '',
      spotify: person.music_links?.spotify || '',
      apple_music: person.music_links?.apple_music || '',
      youtube_music: person.music_links?.youtube_music || '',
      amazon_music: person.music_links?.amazon_music || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPerson) return;

    const { error } = await supabase
      .from('persons')
      .update({ 
        profile_url: formData.profile_url,
        biography: formData.biography,
        music_links: {
          spotify: formData.spotify || null,
          apple_music: formData.apple_music || null,
          youtube_music: formData.youtube_music || null,
          amazon_music: formData.amazon_music || null
        }
      })
      .eq('id', selectedPerson.id);

    if (error) {
      alert('Failed to update person');
    } else {
      alert('Person updated successfully!');
      loadPersons();
      setSelectedPerson(null);
    }
  };

  return (
    <AdminLayout title="Manage Persons" subtitle="Edit cast and crew profiles.">
      <div className="glass-card rounded-2xl p-6">

        <div className="grid md:grid-cols-2 gap-8">
          {/* Persons List */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Select Person ({filteredPersons.length} total)</h2>
            <input
              type="text"
              placeholder="Search persons..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 mb-4"
            />
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div>Loading...</div>
              ) : (
                filteredPersons.map((person) => (
                  <div
                    key={person.id}
                    onClick={() => handleSelectPerson(person)}
                    className={`glass-dark p-4 rounded-lg cursor-pointer hover:bg-white/20 transition flex gap-3 ${
                      selectedPerson?.id === person.id ? 'border-2 border-red-600' : ''
                    }`}
                  >
                    <img loading="lazy"
                      src={person.profile_url || 'https://via.placeholder.com/50x75'}
                      alt={person.name}
                      className="w-12 h-18 object-cover rounded"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/50x75'}
                    />
                    <div className="flex-1">
                      <p className="font-semibold">{person.name}</p>
                      <p className="text-xs text-gray-400">
                        {person.profile_url ? '✓ Image' : '✗ Image'} | {person.biography ? '✓ Bio' : '✗ Bio'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div>
            {selectedPerson ? (
              <div className="glass-dark p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{selectedPerson.name}</h2>
                
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Profile Image URL</label>
                    <input
                      type="url"
                      value={formData.profile_url}
                      onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Biography</label>
                    <textarea
                      value={formData.biography}
                      onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                      placeholder="Enter biography/about information..."
                      rows={6}
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                    />
                  </div>

                  <div className="border-t border-white/20 pt-4">
                    <h3 className="text-lg font-bold mb-3">Music Platform Links (For Composers/Music Directors)</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Spotify Artist Link</label>
                        <input
                          type="url"
                          value={formData.spotify}
                          onChange={(e) => setFormData({ ...formData, spotify: e.target.value })}
                          placeholder="https://open.spotify.com/artist/..."
                          className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Apple Music Artist Link</label>
                        <input
                          type="url"
                          value={formData.apple_music}
                          onChange={(e) => setFormData({ ...formData, apple_music: e.target.value })}
                          placeholder="https://music.apple.com/artist/..."
                          className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">YouTube Music Channel Link</label>
                        <input
                          type="url"
                          value={formData.youtube_music}
                          onChange={(e) => setFormData({ ...formData, youtube_music: e.target.value })}
                          placeholder="https://music.youtube.com/channel/..."
                          className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Amazon Music Artist Link</label>
                        <input
                          type="url"
                          value={formData.amazon_music}
                          onChange={(e) => setFormData({ ...formData, amazon_music: e.target.value })}
                          placeholder="https://music.amazon.com/artists/..."
                          className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                        />
                      </div>
                    </div>
                  </div>

                  {formData.profile_url && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Preview</label>
                      <img loading="lazy"
                        src={formData.profile_url}
                        alt="Preview"
                        className="w-32 h-48 object-cover rounded-lg"
                        onError={(e) => e.target.src = 'https://via.placeholder.com/200x300'}
                      />
                    </div>
                  )}

                  <button type="submit" className="w-full btn-primary py-3">
                    Update Person
                  </button>
                </form>
              </div>
            ) : (
              <div className="glass-dark p-6 rounded-xl text-center text-gray-400">
                Select a person to edit
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManagePersons;


