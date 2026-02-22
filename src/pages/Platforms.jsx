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
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <h1 className="text-lg font-semibold">Platforms</h1>
        {loading ? (
          <p className="mt-4">Loading...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => navigate(`/platforms/${platform.id}`)}
                className="rounded-md bg-[#1a1a1a] border border-gray-800 p-3 flex flex-col items-center justify-center gap-2"
              >
                {platform.logo_url ? (
                  <img loading="lazy" src={platform.logo_url} alt={platform.name} className="max-h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 rounded-md bg-[#2a2a2a] flex items-center justify-center text-xs">
                    {platform.name?.[0] || 'P'}
                  </div>
                )}
                <span className="text-xs text-gray-400 text-center">{platform.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

};

export default Platforms;
