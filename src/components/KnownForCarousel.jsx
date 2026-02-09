import { useState, useRef } from 'react';
import KnownForCard from './KnownForCard';

const KnownForCarousel = ({ works }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef(null);

  const itemsPerPage = 3;
  const totalPages = Math.ceil(works.length / itemsPerPage);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < totalPages - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const threshold = 50;

    if (distance > threshold && canGoNext) {
      handleNext();
    } else if (distance < -threshold && canGoPrev) {
      handlePrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const visibleWorks = works.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Known For</h2>
        <div className="hidden md:flex gap-2">
          <button
            onClick={handlePrev}
            disabled={!canGoPrev}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center"
            aria-label="Previous Known For"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur border border-white/20 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center"
            aria-label="Next Known For"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex gap-3 md:gap-5 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {works.map((work, i) => (
            <KnownForCard key={i} work={work} />
          ))}
        </div>
      </div>

      {/* Mobile Navigation Dots */}
      <div className="flex md:hidden justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition ${
              i === currentIndex ? 'bg-red-600 w-6' : 'bg-white/30'
            }`}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default KnownForCarousel;
