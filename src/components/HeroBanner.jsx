import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHeroBanners } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../hooks/useWatchlist';

const HeroBanner = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, checkInWatchlist } = useWatchlist();
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    checkWatchlistStatus();
  }, [currentIndex, banners, user]);

  const loadFeaturedContent = async () => {
    const { data } = await getHeroBanners();
    const allContent = (data || []).map((banner) => ({
      ...(banner.movie || {}),
      type: 'movie'
    })).filter((item) => item.backdrop_url);
    setBanners(allContent);
    setLoading(false);
  };

  const checkWatchlistStatus = async () => {
    if (user && banners[currentIndex]) {
      const isIn = await checkInWatchlist(banners[currentIndex].id, 'movie');
      setInWatchlist(isIn);
    }
  };

  const handleSwipe = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    if (Math.abs(swipeDistance) > 50) {
      setCurrentIndex((prev) => swipeDistance > 0 ? (prev + 1) % banners.length : (prev - 1 + banners.length) % banners.length);
    }
  };

  const formatRuntime = (mins) => {
    if (!mins) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleWatchlist = async () => {
    if (!user) return navigate('/login');
    await addItem(banners[currentIndex].id, 'movie');
    setInWatchlist(true);
  };

  if (loading || banners.length === 0) {
    return <div className="w-full h-[60vh] bg-white/5 animate-pulse" />;
  }

  const featured = banners[currentIndex];

  return (
    <div
      className="relative w-full h-[60vh] overflow-hidden"
      onTouchStart={(e) => touchStartX.current = e.touches[0].clientX}
      onTouchMove={(e) => touchEndX.current = e.touches[0].clientX}
      onTouchEnd={handleSwipe}
    >
      <img
        key={currentIndex}
        src={featured.backdrop_url}
        alt={featured.title}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 animate-[zoomIn_5s_ease-out]" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#04060b] via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent md:hidden" />

      <div className="relative h-full flex items-end pb-8 px-5">
        <div className="w-full max-w-xl animate-fade-in">
          <h1 className="text-3xl font-bold mb-2 tracking-tight leading-tight">{featured.title}</h1>
          
          <div className="flex items-center gap-2 text-xs text-gray-300 mb-4 flex-wrap">
            {featured.release_date && <span>{featured.release_date.split('-')[0]}</span>}
            {featured.genres?.length > 0 && (
              <>
                <span>•</span>
                <span>{featured.genres.slice(0, 2).join(', ')}</span>
              </>
            )}
            {featured.runtime > 0 && (
              <>
                <span>•</span>
                <span>{formatRuntime(featured.runtime)}</span>
              </>
            )}
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => navigate(`/movie/${featured.id}`)}
              className="px-6 py-2.5 rounded-full font-semibold bg-gradient-to-r from-[#1e8bff] to-[#4fd1ff] shadow-[0_8px_20px_rgba(40,133,255,0.35)] transition-all duration-300 hover:scale-[1.02]"
            >
              View Details
            </button>
            {!inWatchlist && (
              <button
                onClick={handleWatchlist}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,167,255,0.4)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
            <button
              onClick={() => navigator.share?.({ title: featured.title, url: window.location.href })}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-[#3ba7ff] w-8' : 'bg-white/30 w-1.5'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;







