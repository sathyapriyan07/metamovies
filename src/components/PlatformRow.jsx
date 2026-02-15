import { useEffect, useMemo, useRef, useState } from 'react';
import { getMoviesByPlatform } from '../services/supabase';
import PosterCard from './PosterCard';

const DEFAULT_LIMIT = 12;

const PlatformRow = ({
  platformId,
  platformName,
  type = 'both',
  limit = DEFAULT_LIMIT,
  tabs = []
}) => {
  const [activePlatformId, setActivePlatformId] = useState(platformId);
  const [activePlatformName, setActivePlatformName] = useState(platformName);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState({});
  const trackRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setActivePlatformId(platformId);
    setActivePlatformName(platformName);
  }, [platformId, platformName]);

  const rowTitle = useMemo(() => {
    const normalizedType = type === 'both' ? 'Trending' : `${type.charAt(0).toUpperCase()}${type.slice(1)}s`;
    return `${normalizedType} on ${activePlatformName || 'Platform'}`;
  }, [activePlatformName, type]);

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
      if (cache[cacheKey]) {
        setItems(cache[cacheKey]);
        setLoading(false);
        return;
      }

      setLoading(true);
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
      setCache((prev) => ({ ...prev, [cacheKey]: sorted }));
      setLoading(false);
    }, 220);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [activePlatformId, type, limit, cache]);

  if (!activePlatformId) return null;

  return (
    <section className="mb-12 fade-in">
      <div className="px-4 md:px-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-3">
          <span className="w-[3px] h-8 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.65)]" />
          <h2 className="text-xl md:text-2xl font-semibold">
            {rowTitle.split(' on ')[0]} on <span className="text-red-400">{activePlatformName}</span>
          </h2>
        </div>

        {tabs.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = String(activePlatformId) === String(tab.id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActivePlatformId(tab.id);
                    setActivePlatformName(tab.name);
                  }}
                  className={`relative px-2.5 py-1.5 text-sm whitespace-nowrap transition-all duration-250 ${
                    isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {tab.name}
                  <span
                    className={`absolute left-0 right-0 -bottom-[2px] h-[2px] rounded-full bg-red-500 transition-all duration-250 ${
                      isActive ? 'opacity-100 shadow-[0_0_12px_rgba(239,68,68,0.75)]' : 'opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 md:px-8 mt-4 relative">
        <div
          ref={trackRef}
          className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {loading
            ? Array.from({ length: limit }).map((_, i) => (
                <div
                  key={`s-${i}`}
                  className="snap-start flex-shrink-0 w-[42vw] max-w-[170px] md:w-[170px] lg:w-[185px]"
                >
                  <div className="aspect-[2/3] rounded-2xl bg-white/10 animate-pulse" />
                </div>
              ))
            : items.map((item) => (
                <div
                  key={item.id}
                  className="snap-start flex-shrink-0 w-[42vw] max-w-[170px] md:w-[170px] lg:w-[185px]"
                >
                  <div className="rounded-2xl transition-all duration-250 hover:scale-[1.05] hover:shadow-[0_0_18px_rgba(255,255,255,0.18)]">
                    <PosterCard item={item} type="movie" />
                  </div>
                </div>
              ))}
        </div>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => trackRef.current?.scrollBy({ left: 420, behavior: 'smooth' })}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full items-center justify-center bg-white/15 backdrop-blur-[14px] border border-white/30 hover:bg-white/25 transition-all duration-250"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default PlatformRow;
