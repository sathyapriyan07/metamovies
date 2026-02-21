import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getMoviesByPlatform, getPlatforms } from '../services/supabase';
import MovieCard from './MovieCard';
import PlatformButton from './PlatformButton';

const STORAGE_KEY = 'home_active_platform_id';
const DEFAULT_LIMIT = 10;

const PlatformStreamingSection = ({ limit = DEFAULT_LIMIT }) => {
  const [platforms, setPlatforms] = useState([]);
  const [activePlatformId, setActivePlatformId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cacheByPlatform, setCacheByPlatform] = useState({});
  const [isSwitching, setIsSwitching] = useState(false);
  const cacheRef = useRef({});
  const movieTrackRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

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
    setTimeout(() => setIsSwitching(false), 180);
  };

  const activePlatformName = useMemo(
    () => platforms.find((platform) => String(platform.id) === String(activePlatformId))?.name || 'Platform',
    [platforms, activePlatformId]
  );

  const updateMovieFades = useCallback(() => {
    const el = movieTrackRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const hasOverflow = maxScrollLeft > 4;
    if (!hasOverflow) {
      setShowLeftFade(false);
      setShowRightFade(false);
      return;
    }
    setShowLeftFade(el.scrollLeft > 6);
    setShowRightFade(el.scrollLeft < maxScrollLeft - 6);
  }, []);

  useEffect(() => {
    const el = movieTrackRef.current;
    if (!el) return;
    updateMovieFades();
    const onScroll = () => updateMovieFades();
    const onResize = () => updateMovieFades();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [activeMovies, loading, updateMovieFades]);

  if (platforms.length === 0 && !loading) return null;

  return (
    <section className="section-block fade-in">
      <div className="w-full bg-[#0f1626] border border-white/8 rounded-2xl p-4 md:p-6 lg:p-8">
        <div className="mb-4 lg:mb-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">
            Streaming on <span className="text-white/85">{activePlatformName}</span>
          </h2>
        </div>

        <div className="w-full">
          <div className="platform-tabs scrollbar-hide">
            {platforms.map((platform) => {
              const active = String(activePlatformId) === String(platform.id);
              return (
                <PlatformButton
                  key={platform.id}
                  platform={platform}
                  active={active}
                  onClick={() => handlePlatformSelect(platform.id)}
                />
              );
            })}
          </div>
        </div>

        <div className={`transition-opacity duration-200 ${isSwitching ? 'opacity-75' : 'opacity-100'}`}>
          <div className="hidden lg:grid desktop-poster-grid">
            {loading
              ? Array.from({ length: limit }).map((_, i) => (
                  <div key={`s-${i}`} className="aspect-[2/3] rounded-2xl bg-white/10 animate-pulse" />
                ))
              : activeMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
          </div>

          <div className="lg:hidden">
            <div className="carousel-shell">
              <div
                ref={movieTrackRef}
                className="carousel-track flex gap-4 scrollbar-hide snap-x snap-mandatory"
              >
                {loading
                  ? Array.from({ length: limit }).map((_, i) => (
                      <div key={`s-${i}`} className="snap-start flex-shrink-0 w-[125px] md:w-[185px]">
                        <div className="aspect-[2/3] rounded-2xl bg-white/25 animate-pulse" />
                      </div>
                    ))
                  : activeMovies.map((movie) => (
                      <div key={movie.id} className="snap-start flex-shrink-0 w-[125px] md:w-[185px]">
                        <MovieCard movie={movie} />
                      </div>
                    ))}
              </div>
              {showLeftFade && (
                <div className="pointer-events-none absolute inset-y-0 left-0 w-7 md:w-8 lg:w-12 bg-gradient-to-r from-[#04060b]/70 to-transparent" />
              )}
              {showRightFade && (
                <div className="pointer-events-none absolute inset-y-0 right-0 w-7 md:w-8 lg:w-12 bg-gradient-to-l from-[#04060b]/70 to-transparent" />
              )}
            </div>
          </div>

          {!loading && activeMovies.length === 0 && <p className="text-sm text-slate-200/90 py-2">No content available for this platform.</p>}
        </div>
      </div>
    </section>
  );
};

export default memo(PlatformStreamingSection);


