import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlatforms } from '../services/supabase';

const PlatformSkeleton = () => (
  <div className="glass-card rounded-[20px] p-4 animate-pulse h-28 md:h-32" />
);

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
    <div className="min-h-screen pt-6 md:pt-8 lg:pt-10 pb-24 md:pb-12 bg-gradient-to-b from-[#070b14] via-[#04060b] to-[#02040a]">
      <div className="container-desktop">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8">
          Platforms
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <PlatformSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                type="button"
                onClick={() => navigate(`/platforms/${platform.id}`)}
                aria-label={`Open ${platform.name}`}
                className="glass-card rounded-[20px] p-4 min-h-28 md:min-h-32 flex items-center justify-center card-hover"
              >
                {platform.logo_url ? (
                  <img
                    src={platform.logo_url}
                    alt={platform.name}
                    loading="lazy"
                    className="max-h-14 md:max-h-16 w-auto object-contain"
                  />
                ) : (
                  <span className="text-sm md:text-base text-center font-medium text-white">{platform.name}</span>
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




