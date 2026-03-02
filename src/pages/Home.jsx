import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getHeroBanners,
  getCollections,
  getCollectionWithItems,
  getSeries
} from '../services/supabase';
import { getDominantColor, isDarkColor } from '../utils/colorExtractor';

const Home = () => {
  const navigate = useNavigate();
  const [heroBanners, setHeroBanners] = useState([]);
  const [collections, setCollections] = useState([]);
  const [seriesItems, setSeriesItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [showVideo, setShowVideo] = useState({});
  const [isMuted, setIsMuted] = useState(true);
  const [themeColors, setThemeColors] = useState({});
  const [currentThemeColor, setCurrentThemeColor] = useState('rgb(229, 9, 20)');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [hero, cols] = await Promise.all([
      getHeroBanners(),
      getCollections()
    ]);

    const sortedHero = (hero.data || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    setHeroBanners(sortedHero);

    // Extract colors for all hero banners
    sortedHero.forEach(async (banner, index) => {
      if (banner.movie?.backdrop_url) {
        const color = await getDominantColor(banner.movie.backdrop_url);
        setThemeColors(prev => ({ ...prev, [index]: color }));
      }
    });

    const collectionsWithItems = await Promise.all(
      (cols.data || []).map(async (col) => {
        const { data } = await getCollectionWithItems(col.id);
        return {
          ...col,
          items:
            data?.collection_items?.map((item) => ({
              ...(item.movie || {}),
              type: 'movie'
            })) || []
        };
      })
    );
    setCollections(collectionsWithItems);
    await Promise.all([loadSeries()]);
    setLoading(false);
  };

  const loadSeries = async () => {
    const { data } = await getSeries(12, 0);
    setSeriesItems(data || []);
  };

  // Update theme color when slide changes
  useEffect(() => {
    const color = themeColors[currentSlide] || 'rgb(229, 9, 20)';
    setCurrentThemeColor(color);
  }, [currentSlide, themeColors]);

  // Autoplay carousel
  useEffect(() => {
    if (heroBanners.length <= 1 || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroBanners.length, isPaused]);

  // Video fade-in effect
  useEffect(() => {
    setShowVideo({});
    
    const isMobile = window.innerWidth < 640;
    const delay = isMobile ? 3000 : 2500;
    
    const timer = setTimeout(() => {
      setShowVideo({ [currentSlide]: true });
    }, delay);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  // Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }
    if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/;
    const match = url?.match(regExp);
    return match ? match[1] : null;
  };

  const formatRuntime = (mins) => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const textColor = isDarkColor(currentThemeColor) ? 'text-white' : 'text-black';

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Hero Carousel */}
      {heroBanners.length > 0 && (
        <section 
          className="relative h-[70vh] sm:h-[75vh] lg:h-[80vh] min-h-[520px] w-full overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {heroBanners.map((banner, index) => {
            const movie = banner.movie;
            if (!movie) return null;

            const trailerKey = extractYouTubeId(movie.trailer_url);
            const isActive = index === currentSlide;
            const shouldShowVideo = showVideo[index] && trailerKey && isActive;

            return (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {/* Backdrop Image */}
                <img
                  src={movie.backdrop_url || movie.poster_url}
                  alt={movie.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-[6000ms] ${
                    isActive ? 'scale-105' : 'scale-100'
                  } ${shouldShowVideo ? 'opacity-0' : 'opacity-100'}`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />

                {/* Background Trailer Video */}
                {trailerKey && isActive && (
                  <div className={`absolute inset-0 overflow-hidden transition-opacity duration-700 ${
                    shouldShowVideo ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute top-1/2 left-1/2 w-[177.77vh] h-[56.25vw] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2">
                      <iframe
                        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&modestbranding=1&loop=1&playlist=${trailerKey}&rel=0&enablejsapi=1`}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title={`${movie.title} Trailer`}
                      />
                    </div>
                  </div>
                )}

                {/* Dynamic Cinematic Overlays */}
                <div 
                  className="absolute inset-0 z-10 transition-all duration-700"
                  style={{
                    background: `linear-gradient(to top, black, ${currentThemeColor}99, transparent)`
                  }}
                />
                <div 
                  className="absolute inset-0 z-10 transition-all duration-700"
                  style={{
                    background: `linear-gradient(to right, black, ${currentThemeColor}66, transparent)`
                  }}
                />

                {/* Content */}
                <div className="relative z-20 h-full flex items-end">
                  <div className="px-4 sm:px-6 lg:px-8 pb-10 max-w-lg space-y-4 w-full">
                    {/* Title Logo or Text */}
                    {movie.title_logo_url && !movie.use_text_title ? (
                      <img
                        src={movie.title_logo_url}
                        alt={movie.title}
                        className="max-h-20 object-contain"
                      />
                    ) : (
                      <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                        {movie.title}
                      </h1>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3">
                      {movie.imdb_rating && (
                        <span 
                          className={`inline-flex items-center text-sm font-semibold px-3 py-1 rounded-md transition-all duration-700 ${textColor}`}
                          style={{ backgroundColor: currentThemeColor }}
                        >
                          IMDb {movie.imdb_rating}
                        </span>
                      )}
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        {movie.release_date?.split('-')[0] && (
                          <span>{movie.release_date.split('-')[0]}</span>
                        )}
                        {movie.runtime && (
                          <>
                            <span>•</span>
                            <span>{formatRuntime(movie.runtime)}</span>
                          </>
                        )}
                        {movie.genres?.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{movie.genres.slice(0, 2).join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {movie.overview && (
                      <p className="text-sm text-zinc-300 line-clamp-3 leading-relaxed">
                        {movie.overview}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-2 flex-wrap">
                      <button 
                        onClick={() => navigate(`/movie/${movie.id}`)}
                        className={`font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-700 w-full sm:w-auto ${textColor}`}
                        style={{ backgroundColor: currentThemeColor }}
                      >
                        ▶ Watch Now
                      </button>
                      <button 
                        onClick={() => navigate(`/movie/${movie.id}`)}
                        className="bg-zinc-800 border border-zinc-700 text-white px-6 py-3 rounded-xl hover:bg-zinc-700 transition w-full sm:w-auto"
                      >
                        + Watchlist
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sound Toggle */}
                {trailerKey && isActive && shouldShowVideo && (
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-6 right-6 z-30 bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg hover:bg-black/80 transition"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? '🔇' : '🔊'}
                  </button>
                )}
              </div>
            );
          })}

          {/* Indicator Dots */}
          {heroBanners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {heroBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300`}
                  style={{
                    width: index === currentSlide ? '24px' : '8px',
                    backgroundColor: index === currentSlide ? currentThemeColor : 'rgb(113, 113, 122)'
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-400 text-sm">Loading...</p>
          </div>
        ) : (
          <>
            {/* Movie Collections */}
            {collections.length > 0 && collections.map((collection) => (
              <section key={collection.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    {collection.name || 'Collection'}
                  </h2>
                  <button 
                    className="text-sm text-yellow-500 hover:text-yellow-400 transition"
                    onClick={() => navigate('/movies')}
                  >
                    See All
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
                  {collection.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="w-32 flex-shrink-0 snap-start cursor-pointer group"
                      onClick={() => navigate(`/movie/${item.id}`)}
                    >
                      <div className="space-y-2">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900">
                          {typeof item.rating === 'number' && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-md z-10">
                              {item.rating.toFixed(1)}
                            </div>
                          )}
                          <img
                            src={item.poster_url || item.backdrop_url}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white line-clamp-2 leading-tight">
                            {item.title || item.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {item.release_date?.split('-')[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Latest Series Section */}
            {seriesItems.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">
                    Latest TV Shows
                  </h2>
                  <button 
                    className="text-sm text-yellow-500 hover:text-yellow-400 transition"
                    onClick={() => navigate('/series')}
                  >
                    See All
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2">
                  {seriesItems.map((item) => (
                    <div 
                      key={item.id} 
                      className="w-32 flex-shrink-0 snap-start cursor-pointer group"
                      onClick={() => navigate(`/series/${item.id}`)}
                    >
                      <div className="space-y-2">
                        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-900">
                          {typeof item.rating === 'number' && (
                            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-md z-10">
                              {item.rating.toFixed(1)}
                            </div>
                          )}
                          <img
                            src={item.poster_url || item.backdrop_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white line-clamp-2 leading-tight">
                            {item.name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {item.first_air_date?.split('-')[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {collections.length === 0 && seriesItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-zinc-400 text-sm">No content available yet.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

};

export default Home;
