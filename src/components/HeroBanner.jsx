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
        ...(banner.movie || {}),
        type: 'movie'
      }))
      .filter((item) => item.backdrop_url);
    setBanners(allContent);
    setLoading(false);
  };

  const handleSwipe = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (Math.abs(swipeDistance) > 50) {
      setCurrentIndex((prev) => (swipeDistance > 0 ? (prev + 1) % banners.length : (prev - 1 + banners.length) % banners.length));
    }
  };

  if (loading || banners.length === 0) {
    return <div className="w-full h-[55vh] md:h-[70vh] lg:h-[75vh] bg-[#121826] animate-pulse" />;
  }

  const featured = banners[currentIndex];

  return (
    <div
      className="hero relative w-full h-[55vh] md:h-[70vh] lg:h-[75vh] overflow-hidden"
      onTouchStart={(e) => touchStartX.current = e.touches[0].clientX}
      onTouchMove={(e) => touchEndX.current = e.touches[0].clientX}
      onTouchEnd={handleSwipe}
    >
      <img
        src={featured.backdrop_url || 'https://via.placeholder.com/1920x1080'}
        alt={featured.title || featured.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/50 to-transparent" />

      <div className="hero-content relative h-full container-desktop flex items-end pb-12 md:pb-16 lg:pb-16">
        <div className="max-w-[700px] animate-fade-in">
          {featured.title_logo_url && !featured.use_text_title ? (
            <img
              src={featured.title_logo_url}
              alt={featured.title || featured.name}
              className="hero-logo title-logo-glow mb-4"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block';
              }}
            />
          ) : null}
          <h1 className={`hero-title text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 leading-[1.1] ${featured.title_logo_url && !featured.use_text_title ? 'hidden' : ''}`}>
            {featured.title || featured.name}
          </h1>

          <div className="hero-meta flex items-center gap-3 mb-4 text-sm text-secondary flex-wrap">
            {featured.release_date && <span>{featured.release_date.split('-')[0]}</span>}
            {featured.genres && featured.genres.length > 0 && (
              <>
                <span>|</span>
                <span>{featured.genres.slice(0, 2).join(', ')}</span>
              </>
            )}
          </div>

          {featured.overview && (
            <p className="text-secondary text-base mb-6 lg:mb-6 line-clamp-3 leading-relaxed max-w-[600px]">
              {featured.overview}
            </p>
          )}

          <div className="action-buttons flex flex-wrap gap-3">
            {featured.trailer_url && (
              <button
                onClick={() => window.open(featured.trailer_url, '_blank', 'noopener,noreferrer')}
                className="btn-primary"
              >
                Watch Now
              </button>
            )}
            <button onClick={() => navigate(`/${featured.type}/${featured.id}`)} className="btn-ghost">
              Details
            </button>
            {featured.is_now_showing && featured.booking_url && (
              <button
                onClick={() => window.open(featured.booking_url, '_blank', 'noopener,noreferrer')}
                className="btn-ghost inline-flex items-center gap-2 whitespace-nowrap"
              >
                Book Tickets
              </button>
            )}
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
                index === currentIndex ? 'bg-white w-10' : 'bg-white/30 w-4'
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
