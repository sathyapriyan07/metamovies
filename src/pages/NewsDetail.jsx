import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getNewsById, resolveSlug, getPageMeta } from '../services/supabase';
import SeoHead from '../components/SeoHead';

const NewsDetail = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageMeta, setPageMeta] = useState(null);

  useEffect(() => {
    loadNews();
  }, [id]);

  const loadNews = async () => {
    setLoading(true);
    let resolvedId = id;
    if (!/^\d+$/.test(id)) {
      const { data: slugData } = await resolveSlug(id, 'news');
      resolvedId = slugData?.entity_id || id;
    }
    const { data } = await getNewsById(resolvedId);
    setNews(data);
    if (data?.id) {
      const { data: meta } = await getPageMeta('news', String(data.id));
      setPageMeta(meta || null);
    }
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!news) return <p>News not found</p>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <SeoHead
        title={pageMeta?.title || `${news.title} - News`}
        description={pageMeta?.description || news.content?.slice(0, 160)}
        jsonLd={pageMeta?.jsonld || null}
      />
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <h1 className="text-lg font-semibold">{news.title}</h1>
        {news.created_at && (
          <p className="text-xs text-gray-400 mt-2">{new Date(news.created_at).toLocaleDateString()}</p>
        )}
        {news.content && <p className="text-sm text-gray-300 mt-4">{news.content}</p>}
      </div>
    </div>
  );
};

export default NewsDetail;
