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
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-10">
        <h1 className="text-lg font-semibold">Platforms</h1>
        {loading ? (
          <p className="mt-4">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 mt-6">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => navigate(`/platforms/${platform.id}`)}
                className="aspect-[3/2] rounded-md bg-[#1a1a1a] p-3 flex items-center justify-center"
              >
                {platform.logo_url ? (
                  <img loading="lazy" src={platform.logo_url} alt={platform.name} className="max-h-12 object-contain" />
                ) : (
                  <span className="text-sm">{platform.name}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

};

export default Platforms;
