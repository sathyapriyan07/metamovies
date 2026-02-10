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

    const allContent = (data || [])
      .map((banner) => ({
        ...(banner.movie || banner.series),
        type: banner.movie ? 'movie' : 'series'
      }))
      .filter((item) => item.backdrop_url);

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
      className="relative w-full h-[55vh] md:h-[70vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={featured.backdrop_url || 'https://via.placeholder.com/1920x1080'}
        alt={featured.title || featured.name}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,167,255,0.25),transparent_45%)]" />

      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-end pb-12 md:pb-16">
        <div className="max-w-2xl fade-in">
          <p className="text-sky-300 text-xs uppercase tracking-[0.3em] mb-3">Featured</p>
          <h1 className="text-4xl md:text-6xl font-semibold mb-4 tracking-tight">
            {featured.title || featured.name}
          </h1>

          <div className="flex items-center gap-3 mb-4 text-sm md:text-base text-gray-300 flex-wrap">
            {featured.release_date && <span>{featured.release_date.split('-')[0]}</span>}
            {featured.genres && featured.genres.length > 0 && (
              <>
                <span className="text-gray-500">•</span>
                <span>{featured.genres.slice(0, 2).join(' / ')}</span>
              </>
            )}
            {featured.rating && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-sky-200">? {featured.rating.toFixed(1)}</span>
              </>
            )}
          </div>

          {featured.overview && (
            <p className="text-gray-300 text-sm md:text-base mb-6 line-clamp-3 leading-relaxed">
              {featured.overview}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={handleViewClick} className="btn-primary">
              Watch Now
            </button>
            {featured.type === 'movie' && featured.is_now_showing && featured.booking_url && (
              <button
                onClick={() => window.open(featured.booking_url, '_blank', 'noopener,noreferrer')}
                className="btn-ticket flex items-center gap-2"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/75/Bookmyshow-logoid.png"
                  alt="Ticket"
                className="ticket-logo"
                  loading="lazy"
                  decoding="async"
                />\n</button>
            )}
            <button onClick={handleViewClick} className="btn-ghost">
              View Details
            </button>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'bg-sky-300 w-10' : 'bg-white/40 w-4'
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



