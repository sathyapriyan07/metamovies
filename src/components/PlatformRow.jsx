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
  const [tabOffset, setTabOffset] = useState(0);
  const [tabWidth, setTabWidth] = useState(0);
  const trackRef = useRef(null);
  const debounceRef = useRef(null);
  const cacheRef = useRef({});
  const tabRefs = useRef({});

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

  useEffect(() => {
    const activeEl = tabRefs.current[String(activePlatformId)];
    if (!activeEl) return;
    setTabOffset(activeEl.offsetLeft);
    setTabWidth(activeEl.offsetWidth);
  }, [activePlatformId, tabs]);

  if (!activePlatformId) return null;

  return (
    <section className="mb-12 fade-in px-4 md:px-8">
      <div className="rounded-2xl bg-white/15 backdrop-blur-lg border border-white/30 shadow-xl p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-[3px] h-7 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.65)]" />
            <h2 className="text-lg md:text-2xl font-semibold text-white">
              {rowTitle}
              {activePlatformName ? (
                <span className="ml-2 text-red-400">
                  {activePlatformName}
                </span>
              ) : null}
            </h2>
          </div>

          {tabs.length > 0 && (
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                {tabs.map((tab) => {
                  const isActive = String(activePlatformId) === String(tab.id);
                  return (
                    <button
                      key={tab.id}
                      ref={(el) => {
                        if (el) tabRefs.current[String(tab.id)] = el;
                      }}
                      type="button"
                      onClick={() => {
                        setActivePlatformId(tab.id);
                        setActivePlatformName(tab.name);
                        localStorage.setItem('home_active_platform_id', String(tab.id));
                      }}
                      className={`snap-start flex items-center gap-2 rounded-xl px-3 py-2 whitespace-nowrap transition-all duration-250 ${
                        isActive
                          ? 'text-slate-900 bg-white/70 shadow-[0_4px_12px_rgba(255,255,255,0.25)]'
                          : 'text-slate-100 hover:text-white hover:bg-white/15'
                      }`}
                    >
                      {tab.logo_url && (
                        <img
                          src={tab.logo_url}
                          alt={tab.name}
                          loading="lazy"
                          className={`w-4 h-4 object-contain transition-all duration-250 ${isActive ? 'grayscale-0' : 'grayscale opacity-80'}`}
                        />
                      )}
                      <span className="text-sm">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
              <span
                className="absolute bottom-0 h-[2px] bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.75)] transition-all duration-250"
                style={{ left: tabOffset, width: tabWidth }}
              />
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
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center bg-white/20 backdrop-blur-[14px] border border-white/30 hover:bg-white/30 transition-all duration-250"
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
