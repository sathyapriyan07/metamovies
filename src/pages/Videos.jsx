import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFeaturedVideos } from '../services/supabase';

const Videos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    const { data } = await getFeaturedVideos(60, 0);
    setVideos(data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <h1 className="text-lg font-semibold">Videos</h1>
        {loading ? (
          <p className="mt-4">Loading...</p>
        ) : (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Featured</h2>
            <div className="space-y-2">
              {videos.map((video) => (
                <button
                  key={video.id}
                  className="w-full text-left bg-[#1a1a1a] border border-gray-800 rounded-md p-3"
                  onClick={() => navigate(`/videos/${video.id}`)}
                >
                  <p className="text-sm font-medium">{video.title}</p>
                  {video.created_at && (
                    <p className="text-xs text-gray-400 mt-1">{new Date(video.created_at).toLocaleDateString()}</p>
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

export default Videos;
