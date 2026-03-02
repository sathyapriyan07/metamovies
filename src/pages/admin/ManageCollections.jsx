import { useEffect, useState } from 'react';
import { getCollections, createCollection, deleteCollection, getCollectionWithItems, addToCollection, removeFromCollection, getMovies } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const ManageCollections = () => {
  const [collections, setCollections] = useState([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionItems, setCollectionItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    const { data } = await getCollections();
    setCollections(data || []);
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    await createCollection(newCollectionName);
    setNewCollectionName('');
    loadCollections();
  };

  const handleDeleteCollection = async (id, name) => {
    if (confirm(`Delete collection "${name}"?`)) {
      await deleteCollection(id);
      loadCollections();
      if (selectedCollection?.id === id) {
        setSelectedCollection(null);
        setCollectionItems([]);
      }
    }
  };

  const handleSelectCollection = async (collection) => {
    setSelectedCollection(collection);
    const { data } = await getCollectionWithItems(collection.id);
    setCollectionItems(data?.collection_items || []);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const { data } = await getMovies(null, 0);
    const filtered = data?.filter(item => 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
    setSearchResults(filtered);
  };

  const handleAddToCollection = async (itemId) => {
    if (!selectedCollection) return;
    await addToCollection(selectedCollection.id, itemId);
    handleSelectCollection(selectedCollection);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleRemoveFromCollection = async (itemId) => {
    await removeFromCollection(itemId);
    handleSelectCollection(selectedCollection);
  };

  return (
    <AdminLayout title="Manage Collections" subtitle="Curate home page rows and featured lists.">
      <div className="min-h-screen overflow-x-hidden">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="bg-zinc-900 rounded-2xl p-5 sm:p-6 space-y-6 border border-zinc-800 w-full max-w-full">
              <h2 className="text-xl font-semibold">Collections</h2>

              <form onSubmit={handleCreateCollection} className="space-y-3">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="New collection name"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500"
                />
                <button type="submit" className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl hover:bg-yellow-400 transition">
                  Create
                </button>
              </form>

              <div className="space-y-3 overflow-y-auto max-h-[500px]">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all w-full overflow-hidden ${
                      selectedCollection?.id === collection.id
                        ? 'bg-yellow-500 text-black border-yellow-500'
                        : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                    }`}
                    onClick={() => handleSelectCollection(collection)}
                  >
                    <span className="text-sm font-medium truncate">{collection.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection.id, collection.name);
                      }}
                      className="shrink-0 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="bg-zinc-900 rounded-2xl p-5 sm:p-6 space-y-6 border border-zinc-800 w-full max-w-full">
              {selectedCollection ? (
                <>
                  <h2 className="text-xl font-semibold">{selectedCollection.name}</h2>

                  {/* Add Items */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-300">Add Items</h3>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search movies..."
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-500"
                    />
                    <button onClick={handleSearch} className="w-full bg-zinc-800 border border-zinc-700 py-3 rounded-xl text-sm hover:bg-zinc-700 transition">
                      Search
                    </button>

                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 bg-zinc-800 rounded-xl p-3 border border-zinc-700 w-full overflow-hidden">
                            <span className="text-sm truncate">{item.title}</span>
                            <button
                              onClick={() => handleAddToCollection(item.id)}
                              className="shrink-0 bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg transition"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Current Items */}
                  <div className="space-y-3 overflow-y-auto max-h-[500px]">
                    <h3 className="text-sm font-semibold text-zinc-300">Collection Items</h3>
                    {collectionItems.map((item) => {
                      const content = item.movie;
                      return (
                        <div key={item.id} className="flex items-center justify-between gap-3 bg-zinc-800 rounded-xl p-3 border border-zinc-700 w-full overflow-hidden">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              loading="lazy"
                              src={content.poster_url || 'https://via.placeholder.com/50x75'}
                              alt={content.title}
                              className="w-12 h-16 rounded-md object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{content.title}</p>
                              <p className="text-xs text-zinc-400">Movie</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCollection(item.id)}
                            className="shrink-0 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg transition"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center text-zinc-400 py-12">
                  Select a collection to manage items
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageCollections;
