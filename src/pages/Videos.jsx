import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import VideoCard from '../components/VideoCard';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="mb-8">
          <p className="text-sky-300 text-xs uppercase tracking-[0.3em]">Discover</p>
          <h1 className="text-3xl md:text-5xl font-semibold mt-2">Featured Videos</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            No videos available yet
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;
