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

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const loadFeaturedContent = async () => {
    const { data } = await getHeroBanners();

    const allContent = (data || []).map((banner) => ({
      ...(banner.movie || {}),
      type: 'movie'
    })).filter((item) => item.backdrop_url);

    setBanners(allContent);
    setLoading(false);
  };

  const handleSwipe = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      } else {
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

  if (loading || banners.length === 0) {
    return <div className="w-full h-[55vh] md:h-[70vh] bg-white/5 animate-pulse" />;
  }

  const featured = banners[currentIndex];

  return (
    <div
      className="relative w-full h-[58vh] md:h-[60vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={featured.backdrop_url || 'https://via.placeholder.com/1920x1080'}
        alt={featured.title || featured.name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      <div className="relative h-full max-w-[1320px] mx-auto px-4 md:px-8 flex flex-col justify-end pb-8 md:pb-16">
        <div className="max-w-3xl animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-3 tracking-tight">
            {featured.title || featured.name}
          </h1>

          <div className="flex items-center gap-2 md:gap-3 mb-4 text-xs md:text-sm text-gray-300 flex-wrap">
            {featured.release_date && <span>{featured.release_date.split('-')[0]}</span>}
            {featured.genres && featured.genres.length > 0 && (
              <>
                <span>•</span>
                <span>{featured.genres[0]}</span>
              </>
            )}
            {typeof featured.rating === 'number' && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  ⭐ {featured.rating.toFixed(1)}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3 mt-4">
            <button onClick={handleViewClick} className="px-6 md:px-8 py-2.5 md:py-3 rounded-full font-semibold bg-white text-black hover:bg-white/90 transition-all active:scale-95">
              View Details
            </button>
            {featured.trailer_url && (
              <button
                onClick={() => window.open(featured.trailer_url, '_blank', 'noopener,noreferrer')}
                className="px-5 md:px-6 py-2.5 md:py-3 rounded-full font-medium border border-white/30 bg-white/10 backdrop-blur hover:bg-white/20 transition-all active:scale-95"
              >
                Trailer
              </button>
            )}
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 md:h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-8 md:w-10' : 'bg-white/40 w-4'
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







