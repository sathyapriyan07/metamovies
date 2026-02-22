import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNews } from '../services/supabase';

const News = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    setLoading(true);
    const { data } = await getNews(60, 0);
    setNews(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <h1 className="text-lg font-semibold">News</h1>
        {loading ? (
          <p className="mt-4">Loading...</p>
        ) : (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Latest</h2>
            <div className="space-y-2">
              {news.map((item) => (
                <button
                  key={item.id}
                  className="w-full text-left bg-[#1a1a1a] border border-gray-800 rounded-md p-3"
                  onClick={() => navigate(`/news/${item.id}`)}
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.created_at && (
                    <p className="text-xs text-gray-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default News;
