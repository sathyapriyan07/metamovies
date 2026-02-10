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
      <div className="glass-card rounded-2xl p-6">

        <div className="grid md:grid-cols-2 gap-8">
          {/* Collections List */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Collections</h2>
            
            <form onSubmit={handleCreateCollection} className="mb-6">
              <div className="flex gap-2">
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

            <div className="space-y-2">
              {collections.map((collection) => (
                <div
                  key={collection.id}
                  className={`glass-dark p-4 rounded-lg flex justify-between items-center cursor-pointer ${selectedCollection?.id === collection.id ? 'border-2 border-red-600' : ''}`}
                  onClick={() => handleSelectCollection(collection)}
                >
                  <span className="font-semibold">{collection.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCollection(collection.id, collection.name);
                    }}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Collection Items */}
          <div>
            {selectedCollection ? (
              <>
                <h2 className="text-2xl font-bold mb-4">{selectedCollection.name}</h2>

                {/* Add Items */}
                <div className="mb-6 glass-dark p-4 rounded-lg">
                  <h3 className="font-bold mb-3">Add Items</h3>
                  <div className="flex gap-2 mb-3">
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
                        <div key={item.id} className="flex justify-between items-center p-2 bg-white/5 rounded">
                          <span className="text-sm">{item.title}</span>
                          <button
                            onClick={() => handleAddToCollection(item.id)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Current Items */}
                <div className="space-y-2">
                  {collectionItems.map((item) => {
                    const content = item.movie;
                    return (
                      <div key={item.id} className="glass-dark p-3 rounded-lg flex gap-3">
                        <img
                          src={content.poster_url || 'https://via.placeholder.com/50x75'}
                          alt={content.title}
                          className="w-12 h-18 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{content.title}</p>
                          <p className="text-xs text-gray-400">Movie</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCollection(item.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center text-gray-400 mt-12">
                Select a collection to manage items
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageCollections;
