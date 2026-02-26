import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getFollowersForEntity, createNotifications } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const AddNews = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Person linking state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [linkedPersons, setLinkedPersons] = useState([]);

  const searchPersons = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('persons')
        .select('id, name, profile_image_url')
        .ilike('name', `%${query}%`)
        .limit(10);
      
      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching persons:', error);
    } finally {
      setSearching(false);
    }
  }, []);

  const debounceSearch = useCallback((query) => {
    const timer = setTimeout(() => searchPersons(query), 300);
    return () => clearTimeout(timer);
  }, [searchPersons]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    debounceSearch(query);
  };

  const addPerson = (person) => {
    if (linkedPersons.length >= 15) {
      setToast({ message: 'Maximum 15 persons allowed', type: 'error' });
      return;
    }
    
    if (linkedPersons.find(p => p.id === person.id)) {
      setToast({ message: 'Person already added', type: 'error' });
      return;
    }
    
    setLinkedPersons([...linkedPersons, { ...person, role: '' }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removePerson = (personId) => {
    setLinkedPersons(linkedPersons.filter(p => p.id !== personId));
  };

  const updatePersonRole = (personId, role) => {
    setLinkedPersons(linkedPersons.map(p => 
      p.id === personId ? { ...p, role } : p
    ));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (imageUrl && !imageUrl.startsWith('https://')) {
      newErrors.imageUrl = 'Image URL must start with https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setSaving(true);
      const autoExcerpt = excerpt.trim() || content.substring(0, 150);
      
      const { data: newsData, error: newsError } = await supabase
        .from('news')
        .insert({
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl.trim() || null,
          excerpt: autoExcerpt,
          is_featured: isFeatured
        })
        .select()
        .single();
      
      if (newsError) throw newsError;
      
      // Link persons
      if (linkedPersons.length > 0) {
        const personLinks = linkedPersons.map(person => ({
          news_id: newsData.id,
          person_id: person.id,
          role: person.role || null
        }));
        
        const { error: linkError } = await supabase
          .from('news_persons')
          .insert(personLinks);
        
        if (linkError) throw linkError;

        for (const person of linkedPersons) {
          const { data: followers } = await getFollowersForEntity('person', person.id);
          const followerIds = (followers || []).map((f) => f.user_id).filter(Boolean);
          if (followerIds.length > 0) {
            const notifications = followerIds.map((userId) => ({
              user_id: userId,
              type: 'news_for_followed_person',
              entity_type: 'news',
              entity_id: String(newsData.id),
              payload: {
                title: 'News update',
                message: `${person.name} is mentioned in a new article.`,
                news_id: newsData.id,
                person_id: person.id
              }
            }));
            await createNotifications(notifications);
          }
        }
      }
      
      setToast({ message: 'News article added successfully', type: 'success' });
      setTimeout(() => navigate('/admin/news'), 1500);
    } catch (error) {
      console.error('Error adding news:', error);
      setToast({ message: error.message || 'Failed to add news', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Add News" subtitle="Create a new news article">
      {toast && <div>{toast.message}</div>}
      
      <div className="glass-card rounded-2xl p-6 max-w-4xl">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-section">
            <h3>Basics</h3>
            <div className="admin-grid">
              <div className="admin-field admin-full">
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: '' });
              }}
              placeholder="Article title"
              className="w-full px-4 py-3 glass-input"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              <div className="admin-field admin-full">
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setErrors({ ...errors, imageUrl: '' });
              }}
              placeholder="https://..."
              className="w-full px-4 py-3 glass-input"
            />
            {errors.imageUrl && <p className="text-red-400 text-sm mt-1">{errors.imageUrl}</p>}
            {imageUrl && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">Preview:</p>
                <img loading="lazy"
                  src={imageUrl}
                  alt="Preview"
                  className="w-full max-w-md rounded-lg"
                  onError={(e) => e.target.src = 'https://via.placeholder.com/640x360'}
                />
              </div>
            )}
              </div>
            </div>
          </div>

          <div className="admin-section">
            <h3>Content</h3>
            <div className="admin-grid">
              <div className="admin-field admin-full">
                <label className="block text-sm font-medium mb-2">Content *</label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setErrors({ ...errors, content: '' });
              }}
              placeholder="Full article content"
              rows={10}
              className="w-full px-4 py-3 glass-input resize-none"
            />
            {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content}</p>}
              </div>

              <div className="admin-field admin-full">
                <label className="block text-sm font-medium mb-2">Excerpt (optional)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary (auto-generated if empty)"
              rows={2}
              className="w-full px-4 py-3 glass-input resize-none"
            />
              </div>
            </div>
          </div>

          {/* Persons Involved Section */}
          <div className="admin-section">
            <h3>People</h3>
            <div className="admin-grid">
              <div className="admin-field admin-full">
                <label className="block text-sm font-medium mb-2">Persons Involved</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search persons..."
                className="w-full px-4 py-3 glass-input"
              />
              {searching && <p className="text-xs text-gray-400 mt-1">Searching...</p>}
              
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 glass-card rounded-lg border border-white/10 max-h-60 overflow-y-auto">
                  {searchResults.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => addPerson(person)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/10 transition text-left"
                    >
                      <img loading="lazy"
                        src={person.profile_image_url || 'https://via.placeholder.com/40'}
                        alt={person.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span>{person.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Linked Persons Chips */}
            {linkedPersons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {linkedPersons.map((person) => (
                  <div key={person.id} className="flex items-center gap-2 px-3 py-2 glass-card rounded-full">
                    <img loading="lazy"
                      src={person.profile_image_url || 'https://via.placeholder.com/24'}
                      alt={person.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm">{person.name}</span>
                    <input
                      type="text"
                      value={person.role}
                      onChange={(e) => updatePersonRole(person.id, e.target.value)}
                      placeholder="Role"
                      className="w-20 px-2 py-1 text-xs bg-white/5 rounded border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => removePerson(person.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">{linkedPersons.length}/15 persons added</p>
              </div>
            </div>
          </div>

          <div className="admin-section">
            <h3>Publish</h3>
            <div className="admin-grid">
              <div className="admin-field admin-full">
                <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4"
              />
              Mark as Featured
            </label>
              </div>
            </div>

            <div className="admin-actions" style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="btn-secondary"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/news')}
                disabled={saving}
                className="btn-ghost disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {showPreview && (
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-xl font-semibold mb-4">Preview</h3>
            <div className="glass-card rounded-2xl overflow-hidden">
              {imageUrl && (
                <div className="aspect-video">
                  <img loading="lazy" src={imageUrl} alt={title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">{title || 'Article Title'}</h2>
                <p className="text-gray-300 whitespace-pre-wrap">{content || 'Article content will appear here...'}</p>
                
                {linkedPersons.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Persons Involved</h3>
                    <div className="flex gap-3 overflow-x-auto">
                      {linkedPersons.map((person) => (
                        <div key={person.id} className="text-center">
                          <img loading="lazy"
                            src={person.profile_image_url || 'https://via.placeholder.com/80'}
                            alt={person.name}
                            className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                          />
                          <p className="text-sm font-medium">{person.name}</p>
                          {person.role && <p className="text-xs text-gray-400">{person.role}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AddNews;


