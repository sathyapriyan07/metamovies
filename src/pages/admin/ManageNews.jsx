import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const ManageNews = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error loading news:', error);
      setToast({ message: 'Failed to load news', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (article) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ is_featured: !article.is_featured })
        .eq('id', article.id);
      
      if (error) throw error;
      setToast({ message: `Article ${!article.is_featured ? 'featured' : 'unfeatured'}`, type: 'success' });
      loadNews();
    } catch (error) {
      console.error('Error toggling featured:', error);
      setToast({ message: 'Failed to update article', type: 'error' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', deleteConfirm.id);
      
      if (error) throw error;
      setToast({ message: 'Article deleted successfully', type: 'success' });
      setDeleteConfirm(null);
      loadNews();
    } catch (error) {
      console.error('Error deleting article:', error);
      setToast({ message: 'Failed to delete article', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <AdminLayout title="Manage News" subtitle="Edit or remove news articles">
      {toast && <div>{toast.message}</div>}
      
      <div className="glass-card rounded-2xl p-4 md:p-6 pb-24 md:pb-12">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-400">{news.length} articles</p>
          <button onClick={() => navigate('/admin/add-news')} className="btn-primary text-sm">
            + Add Article
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block w-8 h-8 border-4 border-white/40 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No articles yet. Add your first article!
          </div>
        ) : (
          <div className="grid gap-3">
            {news.map((article) => (
              <div key={article.id} className="glass-card rounded-2xl border border-white/10  hover:shadow-lg  transition-all duration-250">
                <div className="flex gap-3 items-center p-4">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-24 h-16 object-cover rounded-md shadow-md flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-base font-semibold truncate">{article.title}</h3>
                    <p className="text-xs text-gray-400">{formatDate(article.created_at)}</p>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-1">{article.excerpt}</p>
                  </div>
                </div>

                <div className="px-4 pb-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/news/${article.id}`)}
                    className="px-3 py-2 bg-white/12 hover:bg-white/18 border border-white/16 hover:scale-[1.02] will-change-transform rounded-lg text-xs font-medium shadow-md transition-all duration-200"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(article)}
                    className={`px-3 py-2 hover:scale-[1.02] will-change-transform rounded-lg text-xs font-medium shadow-md transition-all duration-200 ${article.is_featured ? 'bg-white/12 hover:bg-white/18 border border-white/16' : 'bg-white/10 hover:bg-white/16 border border-white/14'}`}
                  >
                    {article.is_featured ? '⭐ Featured' : 'Feature'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(article)}
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
              <h2 className="text-2xl font-bold mb-4">Delete Article</h2>
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

export default ManageNews;




