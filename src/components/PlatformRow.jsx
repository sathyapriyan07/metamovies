import { useEffect, useMemo, useRef, useState } from 'react';
import { getMoviesByPlatform } from '../services/supabase';
import PosterCard from './PosterCard';

const DEFAULT_LIMIT = 12;

const PlatformRow = ({
  platformId,
  platformName,
  type = 'both',
  limit = DEFAULT_LIMIT,
  tabs = [],
  title = 'Streaming Platforms'
}) => {
  const [activePlatformId, setActivePlatformId] = useState(platformId);
  const [activePlatformName, setActivePlatformName] = useState(platformName);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const trackRef = useRef(null);
  const debounceRef = useRef(null);
  const cacheRef = useRef({});

  useEffect(() => {
    if (!tabs.length) {
      setActivePlatformId(platformId);
      setActivePlatformName(platformName);
      return;
    }
    const savedId = localStorage.getItem('home_active_platform_id');
    const savedTab = tabs.find((tab) => String(tab.id) === String(savedId));
    const fallbackTab = tabs.find((tab) => String(tab.id) === String(platformId)) || tabs[0];
    const nextTab = savedTab || fallbackTab;
    if (!nextTab) return;
    setActivePlatformId(nextTab.id);
    setActivePlatformName(nextTab.name);
  }, [platformId, platformName, tabs]);

  const rowTitle = useMemo(() => {
    return `${title}`;
  }, [title]);

  const filterByType = (movies) => {
    if (type === 'both') return movies;
    return movies.filter((movie) => {
      const normalized = String(movie.media_type || movie.type || movie.content_type || '').toLowerCase();
      if (type === 'movie') return normalized === 'movie' || normalized === '';
      return normalized === 'series' || normalized === 'tv';
    });
  };

  useEffect(() => {
    if (!activePlatformId) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const cacheKey = `${activePlatformId}:${type}:${limit}`;
      if (cacheRef.current[cacheKey]) {
        setItems(cacheRef.current[cacheKey]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setIsAnimating(true);
      const { data } = await getMoviesByPlatform(activePlatformId, 60, 0);
      const sorted = (filterByType(data || []) || [])
        .sort((a, b) => {
          const dateA = new Date(a.release_date || 0).getTime();
          const dateB = new Date(b.release_date || 0).getTime();
          const ratingA = Number(a.rating || 0);
          const ratingB = Number(b.rating || 0);
          if (dateA !== dateB) return dateB - dateA;
          return ratingB - ratingA;
        })
        .slice(0, limit);
      setItems(sorted);
      cacheRef.current[cacheKey] = sorted;
      setLoading(false);
      setTimeout(() => setIsAnimating(false), 180);
    }, 220);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activePlatformId, type, limit]);

  if (!activePlatformId) return null;

  return (
    <section className="mb-12 fade-in px-4 md:px-8">
      <div className="rounded-2xl bg-white/12 backdrop-blur-xl border border-white/25 shadow-2xl p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-lg md:text-2xl font-semibold text-white">{rowTitle}</h2>
          </div>

          {tabs.length > 0 && (
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                {tabs.map((tab) => {
                  const isActive = String(activePlatformId) === String(tab.id);
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActivePlatformId(tab.id);
                        setActivePlatformName(tab.name);
                        localStorage.setItem('home_active_platform_id', String(tab.id));
                      }}
                      className={`snap-start flex items-center justify-center w-11 h-11 rounded-full border backdrop-blur-md transition-all duration-300 ${
                        isActive
                          ? 'bg-white/15 border-white/35 scale-[1.05] shadow-[0_0_18px_rgba(255,255,255,0.32)]'
                          : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_12px_rgba(255,255,255,0.18)]'
                      }`}
                      aria-label={tab.name}
                    >
                      {tab.logo_url && (
                        <img
                          src={tab.logo_url}
                          alt={tab.name}
                          loading="lazy"
                          className={`w-5 h-5 object-contain transition-all duration-300 ${isActive ? 'grayscale-0 opacity-100' : 'grayscale opacity-80'}`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 relative">
          <div
            ref={trackRef}
            className={`flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory transition-opacity duration-200 ${isAnimating ? 'opacity-75' : 'opacity-100'}`}
          >
            {loading
              ? Array.from({ length: limit }).map((_, i) => (
                  <div
                    key={`s-${i}`}
                    className="snap-start flex-shrink-0 w-[125px] md:w-[185px]"
                  >
                    <div className="aspect-[2/3] rounded-2xl bg-white/25 animate-pulse" />
                  </div>
                ))
              : items.map((item) => (
                  <div
                    key={item.id}
                    className="snap-start flex-shrink-0 w-[125px] md:w-[185px]"
                  >
                    <div className="transition-all duration-250 hover:scale-[1.05] hover:shadow-[0_0_18px_rgba(255,255,255,0.18)] rounded-2xl">
                      <PosterCard item={item} type="movie" />
                    </div>
                  </div>
                ))}
          </div>
          {!loading && items.length === 0 && (
            <p className="text-sm text-slate-200/90 px-1 py-3">No content available for this platform.</p>
          )}
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => trackRef.current?.scrollBy({ left: 420, behavior: 'smooth' })}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center bg-white/10 backdrop-blur-md border border-white/25 hover:bg-white/15 transition-all duration-300"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PlatformRow;
