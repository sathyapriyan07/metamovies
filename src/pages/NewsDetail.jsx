import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          news_persons(
            id,
            role,
            person:persons(
              id,
              name,
              profile_image_url
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 md:pt-28 pb-24 flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen pt-24 md:pt-28 pb-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Article not found</p>
          <button onClick={() => navigate('/news')} className="btn-primary">
            Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <button 
          onClick={() => navigate('/news')}
          className="text-sky-300 hover:text-white mb-6 flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </button>

        {article.image_url && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="glass-card rounded-2xl p-6 md:p-8">
          <p className="text-sm text-sky-300 mb-4">{formatDate(article.created_at)}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{article.title}</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{article.content}</p>
          </div>
        </div>

        {/* Persons Involved Section */}
        {article.news_persons && article.news_persons.length > 0 && (
          <div className="glass-card rounded-2xl p-6 md:p-8 mt-6">
            <h2 className="text-2xl font-semibold mb-6">Persons Involved</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
              {article.news_persons.map((np) => (
                <div
                  key={np.id}
                  onClick={() => navigate(`/person/${np.person.id}`)}
                  className="flex-shrink-0 text-center cursor-pointer group"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-2 mx-auto glass-card hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                    <img
                      src={np.person.profile_image_url || 'https://via.placeholder.com/100'}
                      alt={np.person.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-sm font-medium line-clamp-1 group-hover:text-sky-300 transition-colors">
                    {np.person.name}
                  </p>
                  {np.role && (
                    <p className="text-xs text-gray-400 line-clamp-1">{np.role}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsDetail;
