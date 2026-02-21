import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getNewsById } from '../services/supabase';

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, [id]);

  const loadNews = async () => {
    setLoading(true);
    const { data } = await getNewsById(id);
    setNews(data);
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!news) return <p>News not found</p>;

  return (
    <div>
      <h1>{news.title}</h1>
      {news.content && <p>{news.content}</p>}
    </div>
  );
};

export default NewsDetail;
