import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getVideoById } from '../services/supabase';

const VideoDetail = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    setLoading(true);
    const { data } = await getVideoById(id);
    setVideo(data);
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!video) return <p>Video not found</p>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <h1 className="text-lg font-semibold">{video.title}</h1>
        {video.description && <p className="text-sm text-gray-300 mt-3">{video.description}</p>}
        {video.video_url && (
          <div className="mt-4">
            <a
              className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-[#F5C518] text-black text-sm"
              href={video.video_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDetail;
