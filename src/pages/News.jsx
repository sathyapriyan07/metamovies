import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import NewsCard from '../components/NewsCard';

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-6 md:pt-8 lg:pt-10 pb-24 md:pb-12">
      <div className="container-desktop">
        <div className="mb-8">
          <p className="text-white/75 text-xs uppercase tracking-[0.3em]">Featured</p>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mt-2">News Highlights</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading news...</p>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No news available yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {news.map((article, index) => (
              <NewsCard key={article.id} article={article} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default News;




