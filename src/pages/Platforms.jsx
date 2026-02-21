import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlatforms } from '../services/supabase';

const Platforms = () => {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlatforms = async () => {
      setLoading(true);
      const { data } = await getPlatforms({ activeOnly: true });
      setPlatforms(data || []);
      setLoading(false);
    };

    loadPlatforms();
  }, []);

  return (
    <div>
      <h1>Platforms</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="platform-grid" style={{ marginTop: 16 }}>
          {platforms.map((platform) => (
            <button key={platform.id} onClick={() => navigate(`/platforms/${platform.id}`)} className="button">
              {platform.logo_url ? (
                <img src={platform.logo_url} alt={platform.name} style={{ maxHeight: 48 }} />
              ) : (
                platform.name
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Platforms;
