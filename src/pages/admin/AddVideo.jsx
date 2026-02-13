import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';
import Toast from '../../components/Toast';

const AddVideo = () => {
  const navigate = useNavigate();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [youtubeId, setYoutubeId] = useState('');
  const [personSearch, setPersonSearch] = useState('');
  const [personResults, setPersonResults] = useState([]);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (personSearch.trim().length < 2) {
      setPersonResults([]);
      return;
    }
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data, error } = await supabase
          .from('persons')
          .select('id, name, profile_path')
          .ilike('name', `%${personSearch}%`)
          .limit(10);
        
        if (!error) {
          setPersonResults(data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [personSearch]);

  const extractYouTubeId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleUrlChange = (url) => {
    setYoutubeUrl(url);
    setErrors({ ...errors, youtubeUrl: '' });
    
    const id = extractYouTubeId(url);
    if (id) {
      setYoutubeId(id);
      if (!title) {
        setTitle(''); // Could fetch from YouTube API here
      }
    } else {
      setYoutubeId('');
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'YouTube URL is required';
    } else if (!extractYouTubeId(youtubeUrl)) {
      newErrors.youtubeUrl = 'Invalid YouTube URL';
    }
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addPerson = (person) => {
    if (selectedPersons.length >= 15) {
      setToast({ message: 'Maximum 15 persons allowed', type: 'error' });
      return;
    }
    if (selectedPersons.find(p => p.id === person.id)) {
      setToast({ message: 'Person already added', type: 'error' });
      return;
    }
    setSelectedPersons([...selectedPersons, { ...person, role: '' }]);
    setPersonSearch('');
    setPersonResults([]);
  };

  const removePerson = (personId) => {
    setSelectedPersons(selectedPersons.filter(p => p.id !== personId));
  };

  const updatePersonRole = (personId, role) => {
    setSelectedPersons(selectedPersons.map(p => 
      p.id === personId ? { ...p, role } : p
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    try {
      setSaving(true);
      const videoId = extractYouTubeId(youtubeUrl);
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .insert({
          title: title.trim(),
          youtube_url: youtubeUrl.trim(),
          youtube_id: videoId,
          description: description.trim() || null,
          thumbnail_url: thumbnailUrl,
          is_featured: isFeatured
        })
        .select()
        .single();
      
      if (videoError) throw videoError;
      
      if (selectedPersons.length > 0) {
        const personLinks = selectedPersons.map(p => ({
          featured_video_id: video.id,
          person_id: p.id,
          role: p.role || null
        }));
        
        const { error: linkError } = await supabase
          .from('featured_video_persons')
          .insert(personLinks);
        
        if (linkError) throw linkError;
      }
      
      setToast({ message: 'Video added successfully', type: 'success' });
      setTimeout(() => navigate('/admin/videos'), 1500);
    } catch (error) {
      console.error('Error adding video:', error);
      setToast({ message: error.message || 'Failed to add video', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title="Add Video" subtitle="Add a new featured video from YouTube">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="glass-card rounded-2xl p-6 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">YouTube URL *</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-4 py-3 glass-input"
            />
            {errors.youtubeUrl && <p className="text-red-400 text-sm mt-1">{errors.youtubeUrl}</p>}
            {youtubeId && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">Preview:</p>
                <img
                  src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
                  alt="Thumbnail"
                  className="w-full max-w-sm rounded-lg"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({ ...errors, title: '' });
              }}
              placeholder="Video title"
              className="w-full px-4 py-3 glass-input"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description (optional)"
              rows={3}
              className="w-full px-4 py-3 glass-input resize-none"
            />
          </div>

          <div>
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

          <div>
            <label className="block text-sm font-medium mb-2">Persons Involved</label>
            <div className="relative">
              <input
                type="text"
                value={personSearch}
                onChange={(e) => setPersonSearch(e.target.value)}
                placeholder="Search persons..."
                className="w-full px-4 py-3 glass-input"
              />
              {searching && <p className="text-xs text-gray-400 mt-1">Searching...</p>}
              {personResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 glass-card rounded-lg max-h-60 overflow-y-auto">
                  {personResults.map(person => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => addPerson(person)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
                    >
                      <img
                        src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : '/placeholder-person.png'}
                        alt={person.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-sm">{person.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {selectedPersons.length > 0 && (
              <div className="mt-3 space-y-2">
                {selectedPersons.map(person => (
                  <div key={person.id} className="flex items-center gap-3 glass-card p-3 rounded-lg">
                    <img
                      src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : '/placeholder-person.png'}
                      alt={person.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className="text-sm flex-1">{person.name}</span>
                    <input
                      type="text"
                      value={person.role}
                      onChange={(e) => updatePersonRole(person.id, e.target.value)}
                      placeholder="Role (optional)"
                      className="px-3 py-1 glass-input text-sm w-32"
                    />
                    <button
                      type="button"
                      onClick={() => removePerson(person.id)}
                      className="text-red-400 hover:text-red-300 text-xl"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <p className="text-xs text-gray-400">{selectedPersons.length}/15 persons</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding...' : 'Add Video'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/videos')}
              disabled={saving}
              className="flex-1 btn-ghost disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddVideo;
