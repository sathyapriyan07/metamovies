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
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [soundtrack, setSoundtrack] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ avg: null, count: 0 });
  const [reviews, setReviews] = useState([]);
  const [pageMeta, setPageMeta] = useState(null);
  const [musicDirector, setMusicDirector] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const sectionRefs = useRef({});

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
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
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }
  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
        <div className="max-w-5xl mx-auto px-4 pt-12 pb-10">Movie not found</div>
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
  const bullet = '\u2022';
  const genresText = Array.isArray(movie.genres) ? movie.genres.join(` ${bullet} `) : movie.genres;
  const metaLine = [year, genresText, runtime].filter(Boolean).join(` ${bullet} `);

  const reviewItems = Array.isArray(reviews) ? reviews : [];
  const mediaVideos = [
    ...(Array.isArray(movie.media_videos) ? movie.media_videos : []),
    ...(movie.trailer_url ? [movie.trailer_url] : [])
  ].filter(Boolean);
  const mediaPhotos = [movie.backdrop_url, movie.poster_url].filter(Boolean);
  const ottPlatforms = movie.watch_links ? Object.entries(movie.watch_links).filter(([, url]) => url) : [];
  const musicPlatforms = movie.music_links ? Object.entries(movie.music_links).filter(([, url]) => url) : [];
  const platformLogos = {
    prime: '/logos/prime.png',
    hotstar: '/logos/hotstar.png',
    zee5: '/logos/zee5.png',
    netflix: 'https://www.freepnglogos.com/uploads/netflix-logo-history-32.png',
    sony_liv: '/logos/sonyliv.png',
    spotify:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/3840px-Spotify_logo_without_text.svg.png',
    apple_music: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/960px-Apple_Music_icon.svg.png',
    youtube_music: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/YouTubeMusic_Logo.png',
    jiosaavn: '/logos/jiosaavn.png'
  };
  const shouldShowLogo = movie?.title_logo_url && movie.title_logo_url.trim() !== '' && !movie.use_text_title;
  const cbfcText = movie?.cbfc || movie?.cbfc_rating || movie?.certification || 'U/A 16+';
  const topCast = Array.isArray(movie.cast) ? movie.cast.slice(0, 3) : [];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'cast', label: 'Cast' },
    { key: 'media', label: 'Trailers & Clips' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'watchlist', label: 'Watchlist' }
  ];

  const scrollToSection = (tabKey) => {
    setActiveTab(tabKey);
    const section = sectionRefs.current[tabKey];
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-black text-zinc-100">
      <SeoHead
        title={pageMeta?.title || `${movie.title} - MetaMovies+`}
        description={pageMeta?.description || movie.overview?.slice(0, 160)}
        image={movie.poster_url || movie.backdrop_url}
        jsonLd={pageMeta?.jsonld || null}
      />

      <div className="max-w-5xl mx-auto px-4 pt-8 pb-12 space-y-6">
        <section className="space-y-3">
          <div className="backdrop-blur-sm">
            <div className="min-h-[48px]">
              {shouldShowLogo ? (
                <img src={movie.title_logo_url} alt={movie.title} className="max-h-12 w-auto object-contain" />
              ) : (
                <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-wide">{movie.title}</h1>
              )}
            </div>
            <p className="text-sm text-zinc-400 mt-2">
              {`CBFC: ${cbfcText}`}
              {metaLine ? ` ${bullet} ${metaLine}` : ''}
            </p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => scrollToSection(tab.key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm border transition ${
                  activeTab === tab.key
                    ? 'bg-amber-600/20 border-amber-500 text-amber-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
            <div className="rounded-xl overflow-hidden shadow-lg bg-zinc-900/80 backdrop-blur">
              {movie.poster_url ? (
                <img loading="lazy" src={movie.poster_url} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
              ) : (
                <div className="w-full aspect-[2/3] bg-zinc-800" />
              )}
            </div>

            <div
              className="relative rounded-xl overflow-hidden shadow-lg bg-black min-h-[220px]"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(12,12,12,0.1) 0%, rgba(12,12,12,0.72) 70%, rgba(12,12,12,0.95) 100%), url(${movie.backdrop_url || movie.poster_url || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {videoId && !videoError ? (
                <iframe
                  className="w-full h-full min-h-[220px]"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={() => setVideoError(true)}
                  loading="lazy"
                />
              ) : null}
            </div>
          </div>

          <div className="text-sm text-zinc-300">
            <span className="text-amber-400 font-medium">
              Rating: {typeof movie.rating === 'number' ? `${movie.rating.toFixed(1)}/10` : 'NR'}
            </span>
            {movie.imdb_rating ? (
              <>
                <span className="mx-2 text-zinc-500">{bullet}</span>
                <a
                  href={movie.imdb_url || '#'}
                  target={movie.imdb_url ? '_blank' : undefined}
                  rel={movie.imdb_url ? 'noopener noreferrer' : undefined}
                  className="text-amber-400 hover:text-amber-300"
                >
                  IMDb {movie.imdb_rating} &gt;
                </a>
              </>
            ) : null}
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-zinc-800/80 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Where to Watch</h3>
              <span className="text-zinc-400">⌄</span>
            </div>
            {ottPlatforms.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {ottPlatforms.slice(0, 4).map(([platform, url]) => {
                  const logoSrc = platformLogos[platform];
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-lg bg-zinc-900 flex items-center justify-center flex-shrink-0"
                    >
                      {logoSrc ? (
                        <img src={logoSrc} alt={platform} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-[10px] text-zinc-300 capitalize">{platform.replace('_', ' ')}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Streaming links unavailable.</p>
            )}
          </div>

          <div className="bg-zinc-800/80 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Cast Preview</h3>
              <span className="text-zinc-400">⌄</span>
            </div>
            {topCast.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {topCast.map((c) => (
                  <button
                    key={`cast-preview-${c.id}`}
                    onClick={() => c.person?.id && navigate(`/person/${c.person.id}`)}
                    className="text-left"
                  >
                    {c.person?.profile_url ? (
                      <img
                        loading="lazy"
                        src={c.person.profile_url}
                        alt={c.person.name}
                        className="w-full aspect-square rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-zinc-700 flex items-center justify-center text-xs">
                        {c.person?.name?.[0] || '?'}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Cast data unavailable.</p>
            )}
          </div>
        </section>

        <section
          ref={(el) => {
            sectionRefs.current.overview = el;
          }}
          className="bg-zinc-800/80 backdrop-blur rounded-2xl p-5 space-y-4"
        >
          <h2 className="font-display text-lg">Overview</h2>
          {movie.overview ? (
            <div>
              <p className={`text-zinc-400 leading-relaxed ${showFullOverview ? '' : 'line-clamp-4'}`}>{movie.overview}</p>
              {movie.overview.length > 180 && (
                <button
                  className="mt-2 text-sm text-amber-400 hover:text-amber-300 transition"
                  onClick={() => setShowFullOverview(!showFullOverview)}
                >
                  {showFullOverview ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>
          ) : (
            <p className="text-zinc-400">No overview available.</p>
          )}

          <div
            ref={(el) => {
              sectionRefs.current.watchlist = el;
            }}
            className="flex flex-wrap gap-3 pt-2"
          >
            <button
              className="border border-amber-500 text-amber-400 rounded-full px-5 py-2 hover:bg-amber-500 hover:text-black transition"
              onClick={toggleWatchlist}
            >
              {inWatchlist ? 'Already Watched' : 'Mark as Watched'}
            </button>
            <button
              className="border border-amber-500 text-amber-400 rounded-full px-5 py-2 hover:bg-amber-500 hover:text-black transition"
              onClick={toggleWatchlist}
            >
              {inWatchlist ? 'In Watchlist' : 'Want to Watch'}
            </button>
            <button
              className="border border-zinc-700 text-zinc-200 rounded-full px-5 py-2 hover:border-zinc-500 transition"
              onClick={() => navigate(`/share/${movie.id}`)}
            >
              Share
            </button>
            {movie.trailer_url && (
              <button
                className="border border-zinc-700 text-zinc-200 rounded-full px-5 py-2 hover:border-zinc-500 transition"
                onClick={() => window.open(movie.trailer_url, '_blank')}
              >
                Watch Trailer
              </button>
            )}
          </div>
        </section>

        {movie.cast?.length > 0 && (
          <section
            ref={(el) => {
              sectionRefs.current.cast = el;
            }}
            className="mt-8 pt-6 border-t border-zinc-800 space-y-4"
          >
            <h2 className="text-lg font-semibold">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                      className="w-full aspect-square rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-xl bg-zinc-800 flex items-center justify-center">
                      {c.person?.name?.[0] || '?'}
                    </div>
                  )}
                  <p className="mt-2 text-sm font-medium truncate">{c.person?.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{c.character}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {(movie.crew || []).length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Crew</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(movie.crew || []).map((member) => (
                <button
                  key={member.id}
                  className="w-full flex items-center gap-3 text-left bg-zinc-800/80 border border-zinc-700 rounded-xl p-3"
                  onClick={() => navigate(`/person/${member.person?.id}`)}
                >
                  {member.person?.profile_url ? (
                    <img
                      loading="lazy"
                      src={member.person.profile_url}
                      alt={member.person.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-xs">
                      {member.person?.name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-zinc-100">{member.person?.name}</p>
                    <p className="text-xs text-zinc-400">{member.job || 'Crew'}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {movie.composer_name && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Music Director</h2>
            <button
              className="w-full flex items-center gap-3 text-left bg-zinc-800/80 border border-zinc-700 rounded-xl p-3"
              onClick={() => {
                if (musicDirector?.id) navigate(`/person/${musicDirector.id}`);
              }}
            >
              {musicDirector?.profile_url ? (
                <img loading="lazy" src={musicDirector.profile_url} alt={movie.composer_name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-xs">
                  {movie.composer_name?.[0] || '?'}
                </div>
              )}
              <div>
                <p className="text-sm text-zinc-100">{movie.composer_name}</p>
                <p className="text-xs text-zinc-400">Music Director</p>
              </div>
            </button>
          </section>
        )}

        {ottPlatforms.length > 0 && (
          <section className="py-2">
            <h2 className="text-lg font-semibold mb-4">Watch On</h2>
            <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
              {ottPlatforms.map(([platform, url]) => {
                const logoSrc = platformLogos[platform];
                return (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="min-w-[80px] flex flex-col items-center">
                    <div className="w-16 h-16 bg-zinc-800/80 rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition border border-zinc-700">
                      {logoSrc ? (
                        <img src={logoSrc} alt={platform} className="w-10 h-10 object-contain" />
                      ) : (
                        <span className="text-xs text-zinc-200 capitalize">{platform.replace('_', ' ')}</span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {musicPlatforms.length > 0 && (
          <section className="py-2">
            <h2 className="text-lg font-semibold mb-4">Listen On</h2>
            <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
              {musicPlatforms.map(([platform, url]) => {
                const logoSrc = platformLogos[platform];
                return (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="min-w-[80px] flex flex-col items-center">
                    <div className="w-16 h-16 bg-zinc-800/80 rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition border border-zinc-700">
                      {logoSrc ? (
                        <img src={logoSrc} alt={platform} className="w-10 h-10 object-contain" />
                      ) : (
                        <span className="text-xs text-zinc-200 capitalize">{platform.replace('_', ' ')}</span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <section className="py-2">
          <h2 className="text-lg font-semibold mb-3">Ratings & Reviews</h2>
          <div
            ref={(el) => {
              sectionRefs.current.reviews = el;
            }}
            className="text-sm text-zinc-300 mb-3"
          >
            <span className="text-amber-400 font-semibold">User Rating:</span>{' '}
            {reviewSummary.avg ? `${reviewSummary.avg.toFixed(1)} / 5` : 'NR'}
            {reviewSummary.count ? ` ${bullet} ${reviewSummary.count} ratings` : ''}
          </div>
          <div className="space-y-3">
            {reviewItems.length > 0 ? (
              reviewItems.slice(0, 2).map((review, idx) => (
                <div key={`review-${idx}`} className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{review.user?.username || 'User'}</span>
                    <span className="text-amber-400">{review.rating || 'NR'}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{review.body || 'Review unavailable.'}</p>
                </div>
              ))
            ) : (
              <div className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-400">No reviews yet.</div>
            )}
          </div>
          <button className="mt-3 text-sm text-zinc-400 hover:text-zinc-100 transition" onClick={() => navigate(`/movie/${movie.id}/reviews`)}>
            See All Reviews
          </button>
        </section>

        {soundtrack.length > 0 && (
          <section className="py-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Soundtrack</h2>
              <button className="text-sm text-amber-400" onClick={() => navigate(`/albums/${soundtrack[0]?.id}`)}>
                View Album
              </button>
            </div>
            <div className="space-y-2">
              {soundtrack.flatMap((album) => (album.tracks || []).slice(0, 3)).map((song) => (
                <button
                  key={`song-${song.id}`}
                  className="w-full text-left bg-zinc-800/80 border border-zinc-700 rounded-xl p-3"
                  onClick={() => navigate(`/songs/${song.id}`)}
                >
                  <div className="text-sm font-medium">{song.title}</div>
                  <div className="text-xs text-zinc-400">Track {song.track_no || '-'}</div>
                </button>
              ))}
            </div>
          </section>
        )}

        {(mediaVideos.length > 0 || mediaPhotos.length > 0) && (
          <section
            ref={(el) => {
              sectionRefs.current.media = el;
            }}
            className="py-2"
          >
            <h2 className="text-lg font-semibold mb-3">Media</h2>
            <div className="grid grid-cols-2 gap-3">
              {mediaVideos.map((url) => {
                const ytVideoId = extractYouTubeId(url);
                const thumb = ytVideoId ? `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg` : null;
                return (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video rounded-xl overflow-hidden bg-zinc-800/80 border border-zinc-700 block"
                  >
                    {thumb ? (
                      <img loading="lazy" src={thumb} alt="Media" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-zinc-400">Play Video</div>
                    )}
                  </a>
                );
              })}
              {mediaPhotos.map((url, idx) => (
                <div key={`${url}-${idx}`} className="aspect-video rounded-xl overflow-hidden bg-zinc-800/80 border border-zinc-700">
                  <img loading="lazy" src={url} alt="Media" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="py-2">
          <h2 className="text-lg font-semibold mb-3">Similar Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {movie.similar_movies?.length ? (
              movie.similar_movies.slice(0, 6).map((item) => (
                <button key={`similar-${item.id}`} className="text-left" onClick={() => navigate(`/movie/${item.id}`)}>
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800/80 border border-zinc-700">
                    {typeof item.rating === 'number' && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-black text-xs font-semibold px-2 py-0.5 rounded">
                        {item.rating.toFixed(1)}
                      </div>
                    )}
                    <img loading="lazy" src={item.poster_url || item.backdrop_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="mt-2 text-sm font-medium truncate">{item.title}</p>
                </button>
              ))
            ) : (
              <div className="col-span-2 text-sm text-zinc-400">No similar movies available.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MovieDetail;
