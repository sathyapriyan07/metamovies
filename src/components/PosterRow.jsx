import { useCallback, useEffect, useRef, useState } from 'react';
import PosterCard from './PosterCard';
import { SkeletonRow } from './SkeletonLoader';

const PosterRow = ({ title, items, type = 'movie', loading = false, subtitle }) => {
  const trackRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const updateFades = useCallback(() => {
    const el = trackRef.current;
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
    if (loading) return;
    const el = trackRef.current;
    if (!el) return;
    updateFades();
    const onScroll = () => updateFades();
    const onResize = () => updateFades();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [items, loading, updateFades]);

  if (loading) return (
    <div className="mb-12">
      <div className="px-4 md:px-8 flex items-end justify-between">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="text-secondary text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className="px-4 md:px-8 mt-4">
        <SkeletonRow />
      </div>
    </div>
  );

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12 fade-in">
      <div className="px-4 md:px-8 flex items-end justify-between">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="text-secondary text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className="px-4 md:px-8 mt-4">
        <div className="relative">
          <div ref={trackRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {items.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-[125px] md:w-[185px]">
                <PosterCard item={item} type={type} />
              </div>
            ))}
          </div>
          {showLeftFade && (
            <div className="pointer-events-none absolute inset-y-0 left-0 w-7 md:w-8 lg:w-10 bg-gradient-to-r from-[#04060b]/65 to-transparent" />
          )}
          {showRightFade && (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-7 md:w-8 lg:w-10 bg-gradient-to-l from-[#04060b]/65 to-transparent" />
          )}
        </div>
      </div>
    </div>
  );
};

export default PosterRow;
