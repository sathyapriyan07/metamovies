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
        <div className="mt-4 grid grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => navigate(`/platforms/${platform.id}`)}
              className="aspect-[3/2] rounded-xl border border-white/10 bg-white/5 p-4 flex items-center justify-center hover:bg-white/10 transition"
            >
              {platform.logo_url ? (
                <img src={platform.logo_url} alt={platform.name} className="max-h-12 object-contain" />
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
