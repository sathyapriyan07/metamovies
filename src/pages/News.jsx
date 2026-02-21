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
    <div>
      <h1>News</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <section className="section">
          <h2 className="section-title">Latest</h2>
          <ul>
            {news.map((item) => (
              <li key={item.id}>
                <button onClick={() => navigate(`/news/${item.id}`)}>{item.title}</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default News;
