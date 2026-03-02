import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getMovieById,
  getMovieRatingsSummary,
  getReviewsByMovie,
  getSoundtrackByMovie,
  getPageMeta,
  recordViewEvent,
  resolveSlug
} from '../services/supabase';
import SeoHead from '../components/SeoHead';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../hooks/useWatchlist';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, removeItem, checkInWatchlist } = useWatchlist();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [soundtrack, setSoundtrack] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ avg: null, count: 0 });
  const [reviews, setReviews] = useState([]);
  const [pageMeta, setPageMeta] = useState(null);
  const [musicDirector, setMusicDirector] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    let resolvedId = id;
    if (!/^\d+$/.test(id)) {
      const { data: slugData } = await resolveSlug(id, 'movie');
      resolvedId = slugData?.entity_id || id;
    }
    const [{ data }, summary, reviewsResp, soundtrackResp] = await Promise.all([
      getMovieById(resolvedId),
      getMovieRatingsSummary(resolvedId),
      getReviewsByMovie(resolvedId, 'latest'),
      getSoundtrackByMovie(resolvedId)
    ]);
    setMovie(data);
    setReviewSummary(summary || { avg: null, count: 0 });
    setReviews(reviewsResp.data || []);
    setSoundtrack(soundtrackResp.data || []);
    if (data?.id) {
      const { data: meta } = await getPageMeta('movie', String(data.id));
      setPageMeta(meta || null);
    }
    if (data?.composer_name) {
      const { data: person } = await supabase
        .from('persons')
        .select('id, name, profile_url, profile_path, profile_image')
        .ilike('name', data.composer_name)
        .limit(1)
        .single();
      setMusicDirector(person || null);
    } else {
      setMusicDirector(null);
    }
    if (data?.id) {
      await recordViewEvent('movie', data.id, user?.id || null);
    }
    if (user && data) {
      const isIn = await checkInWatchlist(data.id, 'movie');
      setInWatchlist(isIn);
    }
    setLoading(false);
  };

  const loadMovie = loadData;

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

  const extractYouTubeId = (url) => {
    const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/;
    const match = url?.match(regExp);
    return match ? match[1] : null;
  };

  const videoId = useMemo(() => {
    if (!movie?.trailer_url) return null;
    return extractYouTubeId(movie.trailer_url);
  }, [movie?.trailer_url]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }
  if (!movie) {
    return (
      <div className="min-h-screen bg-black text-zinc-100">
        <div className="px-4 pt-12 pb-10">Movie not found</div>
      </div>
    );
  }

  const year = movie.release_date?.split('-')[0];
  const formatRuntime = (mins) => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };
  const runtime = formatRuntime(movie.runtime);
  const genresText = Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres;
  const reviewItems = Array.isArray(reviews) ? reviews : [];
  const mediaVideos = [
    ...(Array.isArray(movie.media_videos) ? movie.media_videos : []),
    ...(movie.trailer_url ? [movie.trailer_url] : [])
  ].filter(Boolean);
  const ottPlatforms = movie.watch_links ? Object.entries(movie.watch_links).filter(([, url]) => url) : [];
  const platformLogos = {
    prime: '/logos/prime.png',
    hotstar: '/logos/hotstar.png',
    zee5: '/logos/zee5.png',
    netflix: 'https://www.freepnglogos.com/uploads/netflix-logo-history-32.png',
    sony_liv: '/logos/sonyliv.png',
    spotify: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/3840px-Spotify_logo_without_text.svg.png',
    apple_music: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/960px-Apple_Music_icon.svg.png',
    youtube_music: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/YouTubeMusic_Logo.png',
    jiosaavn: '/logos/jiosaavn.png'
  };

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'cast', label: 'Cast' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'related', label: 'Related' }
  ];

  return (
    <div className="min-h-screen bg-black text-zinc-100 px-4 pt-4 pb-24 space-y-6">
      <SeoHead
        title={pageMeta?.title || `${movie.title} - MetaMovies+`}
        description={pageMeta?.description || movie.overview?.slice(0, 160)}
        image={movie.poster_url || movie.backdrop_url}
        jsonLd={pageMeta?.jsonld || null}
      />

      {/* Hero Image */}
      {movie.backdrop_url && (
        <div className="relative -mx-4 h-[50vh] overflow-hidden">
          <img
            src={movie.backdrop_url}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>
      )}

      {/* Title Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{movie.title}</h1>
        {movie.imdb_rating && (
          <a
            href={movie.imdb_url || '#'}
            target={movie.imdb_url ? '_blank' : undefined}
            rel={movie.imdb_url ? 'noopener noreferrer' : undefined}
            className="inline-block bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold"
          >
            ⭐ {movie.imdb_rating}
          </a>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-6 overflow-x-auto border-b border-zinc-800 pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap text-sm relative pb-2 transition ${
              activeTab === tab.key
                ? 'text-yellow-400 font-medium after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-full after:bg-yellow-400'
                : 'text-zinc-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Trailer */}
          {videoId && !videoError && (
            <div className="aspect-video rounded-lg overflow-hidden bg-zinc-900">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={() => setVideoError(true)}
                loading="lazy"
              />
            </div>
          )}

          {/* Description */}
          {movie.overview && (
            <div className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-sm">Description</h3>
              <p className="text-zinc-300 leading-relaxed text-sm">{movie.overview}</p>
            </div>
          )}

          {/* Release Date */}
          {year && (
            <div className="space-y-1">
              <h3 className="text-zinc-200 font-semibold text-sm">Release</h3>
              <p className="text-zinc-400 text-sm">{movie.release_date}</p>
            </div>
          )}

          {/* Runtime */}
          {runtime && (
            <div className="space-y-1">
              <h3 className="text-zinc-200 font-semibold text-sm">Runtime</h3>
              <p className="text-zinc-400 text-sm">{runtime}</p>
            </div>
          )}

          {/* Genre */}
          {genresText && (
            <div className="space-y-1">
              <h3 className="text-zinc-200 font-semibold text-sm">Genre</h3>
              <p className="text-zinc-400 text-sm">{genresText}</p>
            </div>
          )}

          {/* Spoken Languages */}
          {movie.spoken_languages && (
            <div className="space-y-1">
              <h3 className="text-zinc-200 font-semibold text-sm">Spoken Languages</h3>
              <p className="text-zinc-400 text-sm">{movie.spoken_languages}</p>
            </div>
          )}

          {/* Production Countries */}
          {movie.production_countries && (
            <div className="space-y-1">
              <h3 className="text-zinc-200 font-semibold text-sm">Production Countries</h3>
              <p className="text-zinc-400 text-sm">{movie.production_countries}</p>
            </div>
          )}

          {/* Production Companies */}
          {movie.production_companies && (
            <div className="space-y-1">
              <h3 className="text-zinc-200 font-semibold text-sm">Production Companies</h3>
              <p className="text-zinc-400 text-sm">{movie.production_companies}</p>
            </div>
          )}

          {/* Watch Platforms */}
          {ottPlatforms.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-zinc-200 font-semibold text-sm">Where to Watch</h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {ottPlatforms.map(([platform, url]) => {
                  const logoSrc = platformLogos[platform];
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0 hover:bg-zinc-800 transition"
                    >
                      {logoSrc ? (
                        <img src={logoSrc} alt={platform} className="w-9 h-9 object-contain" />
                      ) : (
                        <span className="text-[10px] text-zinc-300 capitalize">{platform.replace('_', ' ')}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              className="bg-yellow-400 text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-yellow-500 transition"
              onClick={toggleWatchlist}
            >
              {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </button>
            <button
              className="bg-zinc-800 text-zinc-100 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-700 transition"
              onClick={() => navigate(`/share/${movie.id}`)}
            >
              Share
            </button>
          </div>
        </div>
      )}

      {activeTab === 'cast' && (
        <div className="space-y-4">
          {movie.cast?.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {movie.cast.slice(0, 12).map((c) => (
                <button
                  key={`cast-${c.id}`}
                  className="text-left"
                  onClick={() => c.person?.id && navigate(`/person/${c.person.id}`)}
                >
                  {c.person?.profile_url ? (
                    <img
                      loading="lazy"
                      src={c.person.profile_url}
                      alt={c.person.name}
                      className="w-full aspect-square rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg bg-zinc-800 flex items-center justify-center text-xs">
                      {c.person?.name?.[0] || '?'}
                    </div>
                  )}
                  <p className="mt-2 text-sm font-medium line-clamp-1">{c.person?.name}</p>
                  <p className="text-xs text-zinc-400 line-clamp-1">{c.character}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No cast information available.</p>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="text-sm text-zinc-300">
            <span className="text-yellow-400 font-semibold">User Rating:</span>{' '}
            {reviewSummary.avg ? `${reviewSummary.avg.toFixed(1)} / 5` : 'Not Rated'}
            {reviewSummary.count > 0 && ` • ${reviewSummary.count} ratings`}
          </div>
          {reviewItems.length > 0 ? (
            <div className="space-y-3">
              {reviewItems.slice(0, 5).map((review, idx) => (
                <div key={`review-${idx}`} className="border-b border-zinc-800 pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{review.user?.username || 'Anonymous'}</span>
                    <span className="text-yellow-400 text-sm font-semibold">{review.rating || 'NR'}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{review.body || 'No review text.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No reviews yet. Be the first to review!</p>
          )}
          <button
            className="text-sm text-yellow-400 hover:underline"
            onClick={() => navigate(`/movie/${movie.id}/reviews`)}
          >
            See All Reviews
          </button>
        </div>
      )}

      {activeTab === 'related' && (
        <div className="space-y-4">
          {movie.similar_movies?.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {movie.similar_movies.slice(0, 9).map((item) => (
                <button
                  key={`similar-${item.id}`}
                  className="text-left"
                  onClick={() => navigate(`/movie/${item.id}`)}
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-zinc-800">
                    {typeof item.rating === 'number' && (
                      <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded">
                        {item.rating.toFixed(1)}
                      </div>
                    )}
                    <img
                      loading="lazy"
                      src={item.poster_url || item.backdrop_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium line-clamp-2">{item.title}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-400">No related movies available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
