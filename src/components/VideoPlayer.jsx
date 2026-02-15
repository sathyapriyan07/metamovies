import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_EMBED_BASE = 'https://vidsrc.xyz/embed/movie/';

const getDefaultEmbedUrl = (tmdbId) => `${DEFAULT_EMBED_BASE}${encodeURIComponent(String(tmdbId))}`;

const isValidEmbedUrl = (value) => {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
};

const isValidTmdbId = (value) => /^\d+$/.test(String(value || '').trim());

const VideoPlayer = ({ tmdbId, enabled, overrideUrl, showFullscreenButton = false }) => {
  const containerRef = useRef(null);
  const frameRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const embedUrl = useMemo(() => {
    if (!enabled) return null;
    if (overrideUrl && isValidEmbedUrl(overrideUrl)) return overrideUrl;
    if (!isValidTmdbId(tmdbId)) return null;
    return getDefaultEmbedUrl(tmdbId);
  }, [enabled, overrideUrl, tmdbId]);

  const handleFullscreen = async () => {
    const container = frameRef.current;
    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        if (screen.orientation?.lock) {
          await screen.orientation.lock('landscape');
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Intentionally ignore unsupported API errors for cross-browser compatibility.
    }
  };

  useEffect(() => {
    const onFullScreenChange = async () => {
      if (!document.fullscreenElement && screen.orientation?.lock) {
        try {
          await screen.orientation.lock('portrait');
        } catch {
          // No-op fallback when orientation lock is unsupported.
        }
      }
    };

    document.addEventListener('fullscreenchange', onFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '180px 0px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!enabled) {
    return (
      <div className="glass-card rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-gray-300">
        Not Available
      </div>
    );
  }

  if (!embedUrl) return null;

  return (
    <div
      ref={containerRef}
      className="glass-card rounded-2xl border border-white/10 bg-black/30 p-2 md:p-3 overflow-hidden"
    >
      <div ref={frameRef} className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
        )}
        {isInView && (
          <iframe
            title="Movie Player"
            src={embedUrl}
            className={`absolute inset-0 h-full w-full ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setLoaded(true)}
          />
        )}
        {showFullscreenButton && (
          <button
            type="button"
            onClick={handleFullscreen}
            className="absolute right-3 top-3 z-20 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/75 transition"
          >
            Fullscreen
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
