import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHeroBanners } from '../services/supabase';

const HeroBanner = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    const { data } = await getHeroBanners();

    const allContent = (data || []).map(banner => ({
      ...(banner.movie || banner.series),
      type: banner.movie ? 'movie' : 'series'
    })).filter(item => item.backdrop_url);

    setBanners(allContent);
    setLoading(false);
  };

  const handleSwipe = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      } else {
        // Swipe right - previous
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
      }
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    handleSwipe();
  };

  const handleViewClick = () => {
    const featured = banners[currentIndex];
    if (featured) {
      navigate(`/${featured.type}/${featured.id}`);
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading || banners.length === 0) {
    return (
      <div className="w-full h-[50vh] md:h-[60vh] bg-gray-900 animate-pulse" />
    );
  }

  const featured = banners[currentIndex];

  return (
    <div 
      className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <img
        src={featured.backdrop_url || 'https://via.placeholder.com/1920x1080'}
        alt={featured.title || featured.name}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Content Container */}
      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-end pb-12 md:pb-16">
        {/* Text Content */}
        <div className="max-w-2xl fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            {featured.title || featured.name}
          </h1>

          {/* Metadata */}
          <div className="flex items-center gap-3 mb-4 text-sm md:text-base">
            {featured.release_date && (
              <span className="text-gray-300">
                {featured.release_date.split('-')[0]}
              </span>
            )}
            {featured.genres && featured.genres.length > 0 && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-gray-300">{featured.genres[0]}</span>
              </>
            )}
            {featured.rating && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-yellow-400 flex items-center gap-1">
                  ⭐ {featured.rating.toFixed(1)}
                </span>
              </>
            )}
          </div>

          {/* Overview */}
          {featured.overview && (
            <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-3 leading-relaxed">
              {featured.overview}
            </p>
          )}

          {/* CTA Button */}
          <button
            onClick={handleViewClick}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
            aria-label="View Details"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            View
          </button>
        </div>
      </div>

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-red-600 w-8'
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
