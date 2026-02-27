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
    await addToCollection(selectedCollection.id, itemId, 'movie');
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
      <div className="w-full px-4 py-6 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="bg-neutral-900 rounded-2xl p-5">
              <h2 className="text-2xl font-bold mb-4">Collections</h2>

              <form onSubmit={handleCreateCollection} className="mb-6">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="New collection name"
                    className="flex-1 px-4 py-2 bg-white/10 rounded-lg border border-white/20"
                  />
                  <button type="submit" className="btn-primary">Create</button>
                </div>
              </form>

              <div className="space-y-3">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className={`flex items-center justify-between bg-neutral-800 rounded-xl p-4 cursor-pointer ${
                      selectedCollection?.id === collection.id ? 'border border-red-500/60' : ''
                    }`}
                    onClick={() => handleSelectCollection(collection)}
                  >
                    <span className="text-sm font-medium truncate min-w-0">{collection.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection.id, collection.name);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="bg-neutral-900 rounded-2xl p-5">
              {selectedCollection ? (
                <>
                  <h2 className="text-2xl font-bold mb-4">{selectedCollection.name}</h2>

                  {/* Add Items */}
                  <div className="mb-6 bg-neutral-800/60 p-4 rounded-xl">
                    <h3 className="font-bold mb-3">Add Items</h3>
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
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
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {searchResults.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-3 bg-neutral-800 rounded-xl p-3">
                            <span className="text-sm truncate min-w-0">{item.title}</span>
                            <button
                              onClick={() => handleAddToCollection(item.id)}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-lg shrink-0"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Current Items */}
                  <div className="space-y-3">
                    {collectionItems.map((item) => {
                      const content = item.movie;
                      return (
                        <div key={item.id} className="flex items-center justify-between gap-3 bg-neutral-800 rounded-xl p-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              loading="lazy"
                              src={content.poster_url || 'https://via.placeholder.com/50x75'}
                              alt={content.title}
                              className="w-12 h-16 rounded-md object-cover"
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{content.title}</p>
                              <p className="text-xs text-gray-400">Movie</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCollection(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 py-12">
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


