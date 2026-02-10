import { useEffect, useState } from 'react';
import { getMovies, createCrew, supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const ManageCrew = () => {
  const [type, setType] = useState('movie');
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [persons, setPersons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [crew, setCrew] = useState([]);
  const [formData, setFormData] = useState({
    person_id: '',
    job: ''
  });

  useEffect(() => {
    loadItems();
    loadPersons();
  }, [type]);

  const loadItems = async () => {
    setLoading(true);
    const { data } = await getMovies(null, 0);
    setItems(data || []);
    setFilteredItems(data || []);
    setSearchQuery('');
    setLoading(false);
  };

  const loadPersons = async () => {
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

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    const { data } = await supabase
      .from('crew')
      .select('*, person:persons(*)')
      .eq('movie_id', item.id);
    setCrew(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem || !formData.person_id || !formData.job) return;

    const crewData = {
      person_id: parseInt(formData.person_id),
      job: formData.job,
      movie_id: type === 'movie' ? selectedItem.id : null,
          };

    await createCrew(crewData);
    alert('Crew member added successfully!');
    setFormData({ person_id: '', job: '' });
    handleSelectItem(selectedItem);
  };

  const handleDelete = async (crewId) => {
    if (!confirm('Remove this crew member?')) return;
    await supabase.from('crew').delete().eq('id', crewId);
    handleSelectItem(selectedItem);
  };

  const filteredPersons = persons.filter(p => 
    p.name.toLowerCase().includes(personSearch.toLowerCase())
  );

  return (
    <AdminLayout title="Manage Crew" subtitle="Assign crew roles to titles.">
      <div className="glass-card rounded-2xl p-6">

        <div className="mb-6">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-2 bg-white/10 rounded-lg border border-white/20"
          >
            <option value="movie" className="bg-black">Movies</option>
                      </select>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Items List */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Select {'Movie'}</h2>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 mb-4"
            />
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {loading ? (
                <div>Loading...</div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className={`glass-dark p-4 rounded-lg cursor-pointer hover:bg-white/20 transition ${
                      selectedItem?.id === item.id ? 'border-2 border-red-600' : ''
                    }`}
                  >
                    <p className="font-semibold">{item.title}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Crew Form */}
          <div>
            {selectedItem ? (
              <div className="glass-dark p-6 rounded-xl">
                <h2 className="text-2xl font-bold mb-4">{selectedItem.title}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Person</label>
                    <input
                      type="text"
                      placeholder="Search person..."
                      value={personSearch}
                      onChange={(e) => setPersonSearch(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 mb-2"
                    />
                    <select
                      value={formData.person_id}
                      onChange={(e) => setFormData({ ...formData, person_id: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                      required
                    >
                      <option value="" className="bg-black">Select person</option>
                      {filteredPersons.map(p => (
                        <option key={p.id} value={p.id} className="bg-black">{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Job</label>
                    <input
                      type="text"
                      value={formData.job}
                      onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                      placeholder="e.g., Director, Music Director, Producer"
                      className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                      required
                    />
                  </div>

                  <button type="submit" className="w-full btn-primary py-3">
                    Add Crew Member
                  </button>
                </form>

                <div className="border-t border-white/20 pt-4">
                  <h3 className="text-lg font-bold mb-3">Current Crew</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {crew.map(c => (
                      <div key={c.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                        <div>
                          <p className="font-semibold">{c.person.name}</p>
                          <p className="text-sm text-gray-400">{c.job}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-dark p-6 rounded-xl text-center text-gray-400">
                Select a {type} to manage crew
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageCrew;
