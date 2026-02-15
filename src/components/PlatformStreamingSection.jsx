import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMoviesByPlatform, getPlatforms } from '../services/supabase';
import MovieCard from './MovieCard';

const STORAGE_KEY = 'home_active_platform_id';
const DEFAULT_LIMIT = 24;

const PlatformStreamingSection = ({ limit = DEFAULT_LIMIT }) => {
  const [platforms, setPlatforms] = useState([]);
  const [activePlatformId, setActivePlatformId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cacheByPlatform, setCacheByPlatform] = useState({});
  const [isSwitching, setIsSwitching] = useState(false);
  const tabRefs = useRef({});
  const cacheRef = useRef({});

  useEffect(() => {
    const loadPlatforms = async () => {
      setLoading(true);
      const { data } = await getPlatforms({ activeOnly: true });
      const rows = data || [];
      setPlatforms(rows);
      if (rows.length === 0) {
        setLoading(false);
        return;
      }

      const storedId = localStorage.getItem(STORAGE_KEY);
      const isStoredValid = rows.some((platform) => String(platform.id) === String(storedId));
      const nextActive = isStoredValid ? storedId : rows[0].id;
      setActivePlatformId(nextActive);
      setLoading(false);
    };

    loadPlatforms();
  }, []);

  const loadPlatformMovies = useCallback(async (platformId) => {
    if (!platformId) return;

    if (cacheRef.current[platformId]) {
      return;
    }

    setLoading(true);
    const { data } = await getMoviesByPlatform(platformId, 60, 0);
    const next = (data || [])
      .sort((a, b) => {
        const dateA = new Date(a.release_date || 0).getTime();
        const dateB = new Date(b.release_date || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, limit);
    cacheRef.current[platformId] = next;
    setCacheByPlatform((prev) => ({ ...prev, [platformId]: next }));
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    loadPlatformMovies(activePlatformId);
  }, [activePlatformId, loadPlatformMovies]);

  const activeMovies = useMemo(
    () => (activePlatformId ? cacheByPlatform[activePlatformId] || [] : []),
    [activePlatformId, cacheByPlatform]
  );

  const handlePlatformSelect = (platformId) => {
    if (String(platformId) === String(activePlatformId)) return;
    setIsSwitching(true);
    setActivePlatformId(platformId);
    localStorage.setItem(STORAGE_KEY, String(platformId));
    const tab = tabRefs.current[String(platformId)];
    tab?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    setTimeout(() => setIsSwitching(false), 180);
  };

  useEffect(() => {
    if (!activePlatformId) return;
    const tab = tabRefs.current[String(activePlatformId)];
    tab?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activePlatformId]);

  const activePlatformName = useMemo(
    () => platforms.find((platform) => String(platform.id) === String(activePlatformId))?.name || 'Platform',
    [platforms, activePlatformId]
  );

  if (platforms.length === 0 && !loading) return null;

  return (
    <section className="mb-12 fade-in px-4 md:px-8">
      <div className="w-full rounded-2xl bg-white/12 backdrop-blur-xl border border-white/25 shadow-2xl p-4 md:p-5">
        <div className="mb-4">
          <h2 className="text-lg md:text-2xl font-semibold text-white">
            Streaming on <span className="text-sky-300 drop-shadow-[0_0_10px_rgba(125,211,252,0.45)]">{activePlatformName}</span>
          </h2>
        </div>

        <div className="w-full overflow-visible mb-4">
          <div className="flex items-center gap-4 overflow-x-auto px-4 py-3 scrollbar-hide snap-x snap-mandatory">
          {platforms.map((platform) => {
            const active = String(activePlatformId) === String(platform.id);
            return (
              <button
                key={platform.id}
                ref={(el) => {
                  if (el) tabRefs.current[String(platform.id)] = el;
                }}
                type="button"
                onClick={() => handlePlatformSelect(platform.id)}
                aria-label={platform.name}
                className={`snap-start flex-shrink-0 px-4 md:px-5 rounded-2xl border backdrop-blur-md transition-all duration-300 flex items-center justify-center min-w-[88px] h-[68px] md:h-[76px] lg:h-[84px] ${
                  active
                    ? 'bg-white/16 border-white/40 ring-1 ring-white/35 scale-[1.05] shadow-[0_4px_14px_rgba(255,255,255,0.16)]'
                    : 'bg-white/6 border-white/22 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_3px_10px_rgba(255,255,255,0.12)]'
                }`}
              >
                {platform.logo_url && (
                  <img
                    src={platform.logo_url}
                    alt={platform.name}
                    loading="lazy"
                    className={`h-[30px] md:h-[34px] lg:h-[38px] w-auto max-w-[120px] object-contain transition-all duration-300 ${active ? 'grayscale-0 opacity-100' : 'grayscale opacity-85'}`}
                  />
                )}
              </button>
            );
          })}
          </div>
        </div>

        <div className={`transition-opacity duration-200 ${isSwitching ? 'opacity-75' : 'opacity-100'}`}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loading
              ? Array.from({ length: limit }).map((_, i) => (
                  <div key={`s-${i}`}>
                    <div className="aspect-[2/3] rounded-2xl bg-white/25 animate-pulse" />
                  </div>
                ))
              : activeMovies.map((movie) => (
                  <div key={movie.id}>
                    <div className="rounded-2xl transition-all duration-200 hover:scale-[1.03]">
                      <MovieCard movie={movie} />
                    </div>
                  </div>
                ))}
          </div>

          {!loading && activeMovies.length === 0 && (
            <p className="text-sm text-slate-200/90 py-2">No content available for this platform.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PlatformStreamingSection;
