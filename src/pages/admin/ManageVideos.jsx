import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const ManageVideos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
      setToast({ message: 'Failed to load videos', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (video) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_featured: !video.is_featured })
        .eq('id', video.id);
      
      if (error) throw error;
      setToast({ message: `Video ${!video.is_featured ? 'featured' : 'unfeatured'}`, type: 'success' });
      loadVideos();
    } catch (error) {
      console.error('Error toggling featured:', error);
      setToast({ message: 'Failed to update video', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', deleteConfirm.id);
      
      if (error) throw error;
      setToast({ message: 'Video deleted successfully', type: 'success' });
      setDeleteConfirm(null);
      loadVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      setToast({ message: 'Failed to delete video', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout title="Manage Videos" subtitle="Edit or remove featured videos">
      {toast && <div>{toast.message}</div>}
      
      <div className="glass-card rounded-2xl p-4 md:p-6 pb-24 md:pb-12">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-400">{videos.length} videos</p>
          <button onClick={() => navigate('/admin/add-video')} className="btn-primary text-sm">
            + Add Video
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
          <div className="text-sm text-gray-400">Loading...</div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No videos yet. Add your first video!
          </div>
        ) : (
          <div className="grid gap-3">
            {videos.map((video) => (
              <div key={video.id} className="glass-card rounded-2xl border border-white/10  hover:shadow-lg  transition-all duration-250">
                <div className="flex gap-3 items-center p-4">
                  <img
                    src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
                    alt={video.title}
                    className="w-24 h-16 object-cover rounded-md shadow-md flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h3 className="text-base font-semibold truncate">{video.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{video.description}</p>
                  </div>
                </div>

                <div className="px-4 pb-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => window.open(video.youtube_url, '_blank')}
                    className="px-3 py-2 bg-white/12 hover:bg-white/18 border border-white/16 hover:scale-[1.02] will-change-transform rounded-lg text-xs font-medium shadow-md transition-all duration-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(video)}
                    className={`px-3 py-2 hover:scale-[1.02] will-change-transform rounded-lg text-xs font-medium shadow-md transition-all duration-200 ${video.is_featured ? 'bg-white/12 hover:bg-white/18 border border-white/16' : 'bg-white/10 hover:bg-white/16 border border-white/14'}`}
                  >
                    {video.is_featured ? '⭐ Featured' : 'Feature'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(video)}
                    className="px-3 py-2 bg-red-600/80 hover:bg-red-600 hover:scale-[1.02] will-change-transform rounded-lg text-xs font-medium shadow-md transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-dark p-6 rounded-xl max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Delete Video</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <strong>{deleteConfirm.title}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/16 border border-white/14 rounded-lg font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageVideos;




