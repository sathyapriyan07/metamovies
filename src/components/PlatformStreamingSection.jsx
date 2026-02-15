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
      <div className="rounded-2xl bg-white/12 backdrop-blur-xl border border-white/25 shadow-2xl p-4 md:p-5">
        <div className="mb-4">
          <h2 className="text-lg md:text-2xl font-semibold text-white">
            Streaming on <span className="text-sky-300 drop-shadow-[0_0_10px_rgba(125,211,252,0.45)]">{activePlatformName}</span>
          </h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory mb-4">
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
                className={`snap-start flex-shrink-0 min-w-[54px] h-11 px-3 rounded-2xl border backdrop-blur-md transition-all duration-300 flex items-center justify-center ${
                  active
                    ? 'bg-white/15 border-white/35 scale-[1.05] shadow-[0_0_18px_rgba(255,255,255,0.32)]'
                    : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_12px_rgba(255,255,255,0.18)]'
                }`}
              >
                {platform.logo_url && (
                  <img
                    src={platform.logo_url}
                    alt={platform.name}
                    loading="lazy"
                    className={`w-5 h-5 object-contain transition-all duration-300 ${active ? 'grayscale-0 opacity-100' : 'grayscale opacity-80'}`}
                  />
                )}
              </button>
            );
          })}
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
