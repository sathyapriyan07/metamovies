import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudios } from '../services/supabase';

const StudioSkeleton = () => (
  <div className="rounded-2xl md:rounded-3xl border border-white/25 bg-white/15 backdrop-blur-xl p-4 animate-pulse h-28 md:h-32" />
);

const Studios = () => {
  const navigate = useNavigate();
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudios = async () => {
      setLoading(true);
      const { data } = await getStudios({ activeOnly: true });
      setStudios(data || []);
      setLoading(false);
    };

    loadStudios();
  }, []);

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12 bg-gradient-to-b from-[#070b14] via-[#04060b] to-[#02040a]">
      <div className="max-w-[1360px] mx-auto px-4 md:px-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Studios
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <StudioSkeleton key={index} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
            {studios.map((studio) => (
              <button
                key={studio.id}
                type="button"
                onClick={() => navigate(`/studios/${studio.id}`)}
                aria-label={`Open ${studio.name}`}
                className="rounded-2xl md:rounded-3xl border border-white/30 bg-white/20 backdrop-blur-[24px] p-4 min-h-28 md:min-h-32 flex items-center justify-center transition-all duration-250 hover:scale-[1.05] hover:shadow-[0_0_24px_rgba(255,255,255,0.28)]"
              >
                {studio.logo_url ? (
                  <img
                    src={studio.logo_url}
                    alt={studio.name}
                    loading="lazy"
                    className="max-h-14 md:max-h-16 w-auto object-contain"
                  />
                ) : (
                  <span className="text-sm md:text-base text-center font-medium text-white">{studio.name}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Studios;
