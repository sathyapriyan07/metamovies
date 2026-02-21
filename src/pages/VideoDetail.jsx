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
    <div>
      <h1>{video.title}</h1>
      {video.description && <p>{video.description}</p>}
      {video.video_url && (
        <p style={{ marginTop: 12 }}>
          <a href={video.video_url} target="_blank" rel="noopener noreferrer">Open Video</a>
        </p>
      )}
    </div>
  );
};

export default VideoDetail;
