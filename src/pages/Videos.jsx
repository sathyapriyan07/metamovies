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
    <div>
      <h1>Videos</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <section className="section">
          <h2 className="section-title">Featured</h2>
          <ul>
            {videos.map((video) => (
              <li key={video.id}>
                <button onClick={() => navigate(`/videos/${video.id}`)}>{video.title}</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Videos;
