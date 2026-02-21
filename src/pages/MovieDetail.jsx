import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../hooks/useWatchlist';

const VIDEO_EXT_RE = /\.(mp4|webm|ogg|m3u8)(\?|#|$)/i;

const parseStartSeconds = (value) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const resolveHeroVideoSource = (url) => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname || '';

  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/i);
  if (ytMatch?.[1]) {
    return { type: 'youtube', id: ytMatch[1] };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch?.[1]) {
    return { type: 'vimeo', id: vimeoMatch[1] };
  }

  if (VIDEO_EXT_RE.test(path) || VIDEO_EXT_RE.test(trimmed)) {
    return { type: 'file', src: trimmed };
  }

  if (host.includes('storage.googleapis.com') || host.includes('supabase.co')) {
    return { type: 'file', src: trimmed };
  }

  return null;
};

const buildYouTubeEmbedUrl = (videoId, autoplay, loop, startSeconds, preferLiteQuality) => {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    mute: '1',
    controls: '0',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    iv_load_policy: '3',
    enablejsapi: '1',
    fs: '0',
    disablekb: '1',
    cc_load_policy: '0'
  });
  if (loop) params.set('loop', '1');
  if (loop) params.set('playlist', videoId);
  if (startSeconds > 0) params.set('start', String(startSeconds));
  if (preferLiteQuality) params.set('vq', 'hd720');
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};

const buildVimeoEmbedUrl = (videoId, autoplay, loop, startSeconds, preferLiteQuality) => {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    muted: '1',
    loop: loop ? '1' : '0',
    controls: '0',
    background: '1',
    byline: '0',
    portrait: '0',
    title: '0',
    badge: '0',
    dnt: '1',
    autopause: '0',
    api: '1'
  });
  if (preferLiteQuality) params.set('quality', '720p');
  const startFragment = startSeconds > 0 ? `#t=${startSeconds}s` : '';
  return `https://player.vimeo.com/video/${videoId}?${params.toString()}${startFragment}`;
};

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, removeItem, checkInWatchlist } = useWatchlist();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [trailerDuration, setTrailerDuration] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [prefersReducedData, setPrefersReducedData] = useState(false);
  const [isHeroInView, setIsHeroInView] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [manualPause, setManualPause] = useState(false);
  const [isHeroMuted, setIsHeroMuted] = useState(() => {
    try {
      const saved = sessionStorage.getItem('hero_video_muted');
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const heroRef = useRef(null);
  const heroVideoRef = useRef(null);
  const youtubeIframeRef = useRef(null);
  const vimeoIframeRef = useRef(null);

  const formatRuntime = (mins) => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 && m > 0 ? `${h}h ${m}m` : h > 0 ? `${h}h` : `${m}m`;
  };

  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
    const videoId = match ? match[1] : null;
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
    return match ? match[1] : null;
  };

  const fetchTrailerDuration = async (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    
    try {
      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`);
      const data = await response.json();
      if (data.items?.[0]?.contentDetails?.duration) {
        return parseDuration(data.items[0].contentDetails.duration);
      }
    } catch (error) {
      console.error('Error fetching YouTube duration:', error);
    }
    return null;
  };

  const parseDuration = (isoDuration) => {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return null;
    
    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    } else {
      return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
    }
  };

  useEffect(() => {
    loadMovie();
  }, [id]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const viewportQuery = window.matchMedia('(max-width: 768px)');
    const handleViewport = () => setIsMobileViewport(viewportQuery.matches);
    handleViewport();
    viewportQuery.addEventListener('change', handleViewport);
    return () => viewportQuery.removeEventListener('change', handleViewport);
  }, []);

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return undefined;
    const handleConnectionChange = () => setPrefersReducedData(!!connection.saveData);
    handleConnectionChange();
    connection.addEventListener?.('change', handleConnectionChange);
    return () => connection.removeEventListener?.('change', handleConnectionChange);
  }, []);

  useEffect(() => {
    const heroNode = heroRef.current;
    if (!heroNode) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeroInView(entry.isIntersecting),
      { threshold: 0.25 }
    );

    observer.observe(heroNode);
    return () => observer.disconnect();
  }, [movie?.id]);

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    handleVisibility();
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const heroVideoSource = useMemo(() => resolveHeroVideoSource(movie?.trailer_url), [movie?.trailer_url]);
  const autoplayEnabled = movie?.autoplay_toggle !== false;
  const loopEnabled = movie?.loop_toggle !== false;
  const startSeconds = parseStartSeconds(movie?.video_start_time);
  const heroPoster = movie?.backdrop_url || movie?.poster_url || null;
  const shouldLoadHeroVideo = !!heroVideoSource && !prefersReducedMotion && isHeroInView && !videoFailed;
  const shouldPlayHeroVideo = shouldLoadHeroVideo && autoplayEnabled && isTabVisible && !manualPause;
  const preferLiteQuality = isMobileViewport || prefersReducedData;
  const iframeCoverStyle = {
    filter: 'brightness(0.88)',
    width: '177.78vh',
    height: '56.25vw',
    minWidth: '100%',
    minHeight: '100%',
    transform: 'translate(-50%, -50%) scale(1.03)',
    transformOrigin: 'center center',
    willChange: 'transform'
  };

  useEffect(() => {
    try {
      sessionStorage.setItem('hero_video_muted', String(isHeroMuted));
    } catch {
      // Ignore storage errors (private mode, restricted env).
    }
  }, [isHeroMuted]);

  useEffect(() => {
    setManualPause(!autoplayEnabled);
    setVideoReady(false);
    setVideoFailed(false);
  }, [movie?.id, movie?.trailer_url, autoplayEnabled]);

  useEffect(() => {
    const videoEl = heroVideoRef.current;
    if (!videoEl || heroVideoSource?.type !== 'file') return;

    if (shouldPlayHeroVideo) {
      videoEl.muted = isHeroMuted;
      videoEl.play().catch(() => setVideoFailed(true));
    } else {
      videoEl.pause();
    }
  }, [shouldPlayHeroVideo, heroVideoSource?.type, isHeroMuted]);

  useEffect(() => {
    const frame = youtubeIframeRef.current;
    if (!frame || heroVideoSource?.type !== 'youtube') return;
    const command = shouldPlayHeroVideo ? 'playVideo' : 'pauseVideo';
    frame.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }),
      '*'
    );
  }, [shouldPlayHeroVideo, heroVideoSource?.type]);

  useEffect(() => {
    if (!videoReady) return;

    if (heroVideoSource?.type === 'file') {
      if (heroVideoRef.current) heroVideoRef.current.muted = isHeroMuted;
      return;
    }

    if (heroVideoSource?.type === 'youtube') {
      const frame = youtubeIframeRef.current;
      const command = isHeroMuted ? 'mute' : 'unMute';
      frame?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: command, args: [] }),
        '*'
      );
      return;
    }

    if (heroVideoSource?.type === 'vimeo') {
      const frame = vimeoIframeRef.current;
      frame?.contentWindow?.postMessage(
        JSON.stringify({ method: 'setVolume', value: isHeroMuted ? 0 : 1 }),
        '*'
      );
      frame?.contentWindow?.postMessage(
        JSON.stringify({ method: 'setMuted', value: isHeroMuted }),
        '*'
      );
    }
  }, [heroVideoSource?.type, isHeroMuted, videoReady]);

  useEffect(() => {
    if (!shouldLoadHeroVideo) return undefined;
    if (heroVideoSource?.type !== 'youtube' && heroVideoSource?.type !== 'vimeo') return undefined;
    if (videoReady) return undefined;

    const timeout = window.setTimeout(() => {
      setVideoFailed(true);
    }, 15000);

    return () => window.clearTimeout(timeout);
  }, [shouldLoadHeroVideo, heroVideoSource?.type, videoReady]);

  const loadMovie = async () => {
    setLoading(true);
    const { data } = await getMovieById(id);
    setMovie(data);
    if (user && data) {
      const isIn = await checkInWatchlist(data.id, 'movie');
      setInWatchlist(isIn);
    }
    if (data?.trailer_url) {
      const duration = await fetchTrailerDuration(data.trailer_url);
      setTrailerDuration(duration);
    }
    setLoading(false);
  };

  const toggleWatchlist = async () => {
    if (!user) return navigate('/login');
    if (inWatchlist) {
      await removeItem(movie.id, 'movie');
      setInWatchlist(false);
    } else {
      await addItem(movie.id, 'movie');
      setInWatchlist(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white/40"></div>
      </div>
    );
  }

  if (!movie) return <div className="min-h-screen flex items-center justify-center">Movie not found</div>;

  const platforms = (movie.movie_platforms || [])
    .map((entry) => entry.platform)
    .filter(Boolean);
  const soundtrackLogos = {
    spotify: {
      label: 'Spotify',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg'
    },
    apple_music: {
      label: 'Apple Music',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/960px-Apple_Music_icon.svg.png'
    },
    youtube_music: {
      label: 'YouTube Music',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg'
    },
    amazon_music: {
      label: 'Amazon Music',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Amazon_Music_logo.svg'
    }
  };

  const soundtrackLinks = Object.entries(soundtrackLogos)
    .map(([key, meta]) => ({
      key,
      label: meta.label,
      logo: meta.logo,
      url: movie?.music_links?.[key] || null
    }))
    .filter((item) => !!item.url);

  return (
    <div className="min-h-screen pb-24 md:pb-12 lg:overflow-x-hidden animate-fade-in">
      {/* Hero Backdrop Section */}
      <div ref={heroRef} className="relative w-full h-[50vh] md:h-[55vh] lg:h-[64vh] overflow-hidden">
        {heroPoster ? (
          <img
            src={heroPoster}
            alt={movie.title}
            className="absolute inset-0 z-0 w-full h-full object-cover scale-105 blur-2xl opacity-35"
          />
        ) : (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#05080f] via-[#0a1324] to-[#04060b]" />
        )}

        {heroPoster && (
          <img
            src={heroPoster}
            alt={movie.title}
            className={`absolute inset-0 z-[5] w-full h-full object-cover transition-opacity duration-500 ${shouldLoadHeroVideo && videoReady ? 'opacity-0' : 'opacity-100'}`}
          />
        )}

        {shouldLoadHeroVideo && heroVideoSource?.type === 'file' && (
          <video
            ref={heroVideoRef}
            src={heroVideoSource.src}
            className={`absolute inset-0 z-[5] w-full h-full object-cover object-center transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            style={{ filter: 'brightness(0.88)' }}
            autoPlay={autoplayEnabled}
            muted={isHeroMuted}
            loop={loopEnabled}
            playsInline
            preload="metadata"
            controls={false}
            disablePictureInPicture
            onLoadedData={(event) => {
              const videoEl = event.currentTarget;
              if (startSeconds > 0 && Number.isFinite(videoEl.duration)) {
                videoEl.currentTime = Math.min(startSeconds, Math.max(videoEl.duration - 0.25, 0));
              }
              setVideoReady(true);
            }}
            onError={() => setVideoFailed(true)}
          />
        )}

        {shouldLoadHeroVideo && heroVideoSource?.type === 'youtube' && (
          <iframe
            ref={youtubeIframeRef}
            src={buildYouTubeEmbedUrl(heroVideoSource.id, autoplayEnabled, loopEnabled, startSeconds, preferLiteQuality)}
            title={`${movie.title} background trailer`}
            className={`absolute left-1/2 top-1/2 z-[5] pointer-events-none transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            style={iframeCoverStyle}
            loading="lazy"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen={false}
            onLoad={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
          />
        )}

        {shouldLoadHeroVideo && heroVideoSource?.type === 'vimeo' && (
          <iframe
            ref={vimeoIframeRef}
            src={buildVimeoEmbedUrl(heroVideoSource.id, autoplayEnabled, loopEnabled, startSeconds, preferLiteQuality)}
            title={`${movie.title} background trailer`}
            className={`absolute left-1/2 top-1/2 z-[5] pointer-events-none transition-opacity duration-700 ${videoReady ? 'opacity-100' : 'opacity-0'}`}
            style={iframeCoverStyle}
            loading="lazy"
            allow="autoplay; fullscreen"
            allowFullScreen={false}
            onLoad={() => setVideoReady(true)}
            onError={() => setVideoFailed(true)}
          />
        )}

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#04060b] via-[#04060b]/80 to-transparent" />
        
        <div className="relative z-20 h-full flex items-end pb-6 lg:pb-10">
          <div className="container-desktop">
            <div className="max-w-[700px]">
            {/* Title Logo or Text */}
            {movie.title_logo_url && !movie.use_text_title ? (
              <div className="mb-3 md:mb-4">
                <img
                  src={movie.title_logo_url}
                  alt={`${movie.title} logo`}
                  className="title-logo-glow max-h-16 md:max-h-20 lg:max-h-28 object-contain self-start"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'block';
                  }}
                />
                <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] hidden">
                  {movie.title || 'Untitled'}
                </h1>
              </div>
            ) : (
              <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 md:mb-4 leading-[1.1]">
                {movie.title || 'Untitled'}
              </h1>
            )}
            
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300 flex-wrap mb-4 lg:mb-5">
              {movie.release_date && <span>{movie.release_date.split('-')[0]}</span>}
              {movie.runtime > 0 && (
                <>
                  <span>|</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                </>
              )}
              {movie.genres?.length > 0 && (
                <>
                  <span>|</span>
                  <span>{movie.genres.slice(0, 2).join(', ')}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
              {shouldLoadHeroVideo && heroVideoSource?.type === 'file' && (
                <button
                  type="button"
                  onClick={() => setManualPause((prev) => !prev)}
                  className="btn-icon"
                  aria-label={manualPause ? 'Play hero video' : 'Pause hero video'}
                  aria-pressed={manualPause}
                >
                  {manualPause ? (
                    <svg className="w-5 h-5 md:w-[22px] md:h-[22px] text-white/92" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7-11-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 md:w-[22px] md:h-[22px] text-white/92" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M7 5h4v14H7zm6 0h4v14h-4z" />
                    </svg>
                  )}
                </button>
              )}
              {shouldLoadHeroVideo && (
                <button
                  type="button"
                  onClick={() => setIsHeroMuted((prev) => !prev)}
                  className="btn-icon"
                  aria-label={isHeroMuted ? 'Unmute hero video' : 'Mute hero video'}
                  aria-pressed={!isHeroMuted}
                >
                  {isHeroMuted ? (
                    <svg className="w-5 h-5 md:w-[22px] md:h-[22px] text-white/92" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H3v6h3l5 4V5Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="m22 9-6 6" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16 9 6 6" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 md:w-[22px] md:h-[22px] text-white/92" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5 6 9H3v6h3l5 4V5Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8.5a5 5 0 0 1 0 7" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 6a9 9 0 0 1 0 12" />
                    </svg>
                  )}
                </button>
              )}
              {movie.is_now_showing && movie.booking_url && (
                <button
                  onClick={() => window.open(movie.booking_url, '_blank')}
                  className="btn-primary"
                >
                  Book Tickets
                </button>
              )}
              {movie.trailer_url && (
                <button
                  onClick={() => window.open(movie.trailer_url, '_blank')}
                  className="btn-ghost"
                >
                  Watch Trailer
                </button>
              )}
              <button
                onClick={toggleWatchlist}
                className={`btn-icon ${inWatchlist ? 'bg-white/12' : ''}`}
                aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <svg className={`w-5 h-5 md:w-[22px] md:h-[22px] ${inWatchlist ? 'text-white' : 'text-white/92'}`} fill={inWatchlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                onClick={() => navigator.share?.({ title: movie.title, url: window.location.href })}
                className="btn-icon"
                aria-label="Share movie"
              >
                <svg className="w-5 h-5 md:w-[22px] md:h-[22px] text-white/92" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      <div className="movie-detail-wrapper">
        <aside>
            <div className="sidebar-card bg-[#0f1626] border border-white/8 rounded-xl p-4">
              <div className="aspect-[2/3] w-full overflow-hidden rounded-xl bg-black/40">
                <img
                  src={movie.poster_url || movie.backdrop_url || 'https://via.placeholder.com/300x450'}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {movie.overview && (
              <section className="sidebar-card bg-[#0f1626] border border-white/8 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-muted mb-2">About</h3>
                <h4 className="text-lg font-semibold mb-2">{movie.title}</h4>
                {movie.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {movie.genres.slice(0, 3).map((genre, i) => (
                      <span key={i} className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10">
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
                <p className={`text-sm text-secondary leading-relaxed ${!showFullOverview ? 'line-clamp-5' : ''}`}>
                  {movie.overview}
                </p>
                {movie.overview.length > 200 && (
                  <button
                    onClick={() => setShowFullOverview(!showFullOverview)}
                    className="text-sm mt-3 font-medium text-white/80 hover:text-white transition"
                  >
                    {showFullOverview ? 'Less' : 'More'}
                  </button>
                )}
              </section>
            )}

            {(typeof movie.rating === 'number' || typeof movie.imdb_rating === 'number') && (
              <section className="sidebar-card bg-[#0f1626] border border-white/8 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-muted mb-3">Ratings</h3>
                <div className="space-y-3">
                  {typeof movie.rating === 'number' && (
                    <div className="flex items-center gap-3">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tmdb.new.logo.svg/3840px-Tmdb.new.logo.svg.png"
                        alt="TMDB"
                        className="h-5 w-auto"
                      />
                      <span className="text-lg font-semibold">{movie.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {typeof movie.imdb_rating === 'number' && (
                    <div className="flex items-center gap-3">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/960px-IMDB_Logo_2016.svg.png"
                        alt="IMDb"
                        className="h-4 w-auto"
                      />
                      <span className="text-lg font-semibold">{movie.imdb_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="sidebar-card bg-[#0f1626] border border-white/8 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-muted mb-4">Information</h3>
              <div className="space-y-3 text-sm">
                {movie.release_date && (
                  <div className="flex justify-between">
                    <span className="text-muted">Release Year</span>
                    <span className="text-white font-medium">{movie.release_date.split('-')[0]}</span>
                  </div>
                )}
                {movie.runtime > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted">Runtime</span>
                    <span className="text-white font-medium">{formatRuntime(movie.runtime)}</span>
                  </div>
                )}
                {typeof movie.rating === 'number' && (
                  <div className="flex justify-between">
                    <span className="text-muted">Rating</span>
                    <span className="text-white font-medium">{movie.rating.toFixed(1)}/10</span>
                  </div>
                )}
                {movie.genres?.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted">Genres</span>
                    <span className="text-white font-medium text-right">{movie.genres.join(', ')}</span>
                  </div>
                )}
              </div>
            </section>

            {movie.watch_links && (movie.watch_links.netflix || movie.watch_links.prime || movie.watch_links.hotstar) && (
              <section className="sidebar-card bg-[#0f1626] border border-white/8 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-muted mb-3">Watch Now</h3>
                <div className="flex flex-wrap gap-3">
                  {movie.watch_links.netflix && (
                    <a
                      href={movie.watch_links.netflix}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 px-4 rounded-full bg-white/8 border border-white/12 flex items-center justify-center hover:bg-white/12 transition"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png" alt="Netflix" className="h-5 w-auto" />
                    </a>
                  )}
                  {movie.watch_links.prime && (
                    <a
                      href={movie.watch_links.prime}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 px-4 rounded-full bg-white/8 border border-white/12 flex items-center justify-center hover:bg-white/12 transition"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/960px-Amazon_Prime_Video_logo.svg.png" alt="Prime" className="h-5 w-auto" />
                    </a>
                  )}
                  {movie.watch_links.hotstar && (
                    <a
                      href={movie.watch_links.hotstar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-11 px-4 rounded-full bg-white/8 border border-white/12 flex items-center justify-center hover:bg-white/12 transition"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/jiohotstar.png" alt="JioHotstar" className="h-6 w-auto" />
                    </a>
                  )}
                </div>
              </section>
            )}

            {platforms.length > 0 && (
              <section className="sidebar-card bg-[#0f1626] border border-white/8 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-muted mb-3">Platforms</h3>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform) => (
                    <button
                      type="button"
                      key={platform.id}
                      onClick={() => navigate(`/platforms/${platform.id}`)}
                      className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-white hover:bg-white/10 transition"
                    >
                      {platform.name}
                    </button>
                  ))}
                </div>
              </section>
            )}
        </aside>

          <div className="movie-main space-y-10 lg:space-y-16">
            {movie.trailer_url && (
              <section>
                <div className="section-header mb-4">
                  <h2 className="text-2xl md:text-3xl font-semibold">Trailers</h2>
                </div>
                <div className="carousel-shell">
                  <div className="carousel-track flex gap-4 scrollbar-hide">
                    <div className="flex-shrink-0 w-[280px] md:w-[360px] snap-start group cursor-pointer">
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#111827] border border-white/10 card-hover">
                        <img
                          src={getYouTubeThumbnail(movie.trailer_url) || movie.backdrop_url}
                          alt="Official Trailer"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/15 border border-white/20 flex items-center justify-center">
                            <svg className="w-6 h-6 ml-1 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        <a
                          href={movie.trailer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {movie.player_enabled && (movie.tmdb_id || movie.player_url_override) && (
              <section>
                <button
                  type="button"
                  onClick={() => navigate(`/watch/${movie.id}`)}
                  className="btn-primary"
                >
                  Watch {movie.title}
                </button>
              </section>
            )}

            {soundtrackLinks.length > 0 && (
              <section>
                <div className="mb-3">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-muted">Original Score and Songs</p>
                  <h3 className="text-2xl font-semibold mt-1">Soundtrack</h3>
                </div>
                <div className="carousel-shell">
                  <div className="carousel-track flex gap-3 scrollbar-hide">
                    {soundtrackLinks.map((item) => (
                      <a
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 snap-start h-11 px-4 rounded-full bg-white/8 border border-white/12 flex items-center justify-center hover:bg-white/12 transition"
                        aria-label={`Open ${item.label}`}
                      >
                        <img
                          src={item.logo}
                          alt={item.label}
                          loading="lazy"
                          className="h-5 md:h-6 w-auto object-contain"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {movie.cast?.length > 0 && (
              <section>
                <div className="section-header mb-4">
                  <h2 className="text-2xl md:text-3xl font-semibold">Cast and Crew</h2>
                  <button
                    onClick={() => navigate(`/movie/${movie.id}/cast-crew`)}
                    className="text-sm text-white/70 hover:text-white transition"
                  >
                    View All
                  </button>
                </div>
                <div className="cast-row scrollbar-hide">
                  {movie.cast.slice(0, 15).map((c) => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/person/${c.person.id}`)}
                      className="flex-shrink-0 cursor-pointer group w-[110px] lg:w-[120px] xl:w-[130px]"
                    >
                      <div className="w-[110px] h-[110px] lg:w-[120px] lg:h-[120px] xl:w-[130px] xl:h-[130px] rounded-full overflow-hidden bg-[#101827] border border-white/10">
                        {c.person.profile_url ? (
                          <img
                            src={c.person.profile_url}
                            alt={c.person.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted">N/A</div>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-center line-clamp-2 mt-3">{c.person.name}</p>
                      <p className="text-xs text-muted text-center line-clamp-1">{c.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
      </div>
    </div>
  );
};

export default MovieDetail;





