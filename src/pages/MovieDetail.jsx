import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById } from '../services/supabase';
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

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    setLoading(true);
    const { data } = await getMovieById(id);
    setMovie(data);
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
    const regExp =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/;
    const match = url?.match(regExp);
    return match ? match[1] : null;
  };
  const videoId = useMemo(() => {
    if (!movie?.trailer_url) return null;
    return extractYouTubeId(movie.trailer_url);
  }, [movie?.trailer_url]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }
  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Movie not found</div>
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
  const genresText = Array.isArray(movie.genres)
    ? movie.genres.join(` ${bullet} `)
    : movie.genres;
  const metaLine = [year, runtime, genresText].filter(Boolean).join(` ${bullet} `);

  const reviewItems = Array.isArray(movie.reviews) ? movie.reviews : [];
  const mediaVideos = movie.trailer_url ? [movie.trailer_url] : [];
  const mediaPhotos = [movie.backdrop_url, movie.poster_url].filter(Boolean);
  const ottPlatforms = movie.watch_links
    ? Object.entries(movie.watch_links).filter(([, url]) => url)
    : [];
  const musicPlatforms = movie.music_links
    ? Object.entries(movie.music_links).filter(([, url]) => url)
    : [];
  const platformLogos = {
    prime: '/logos/prime.png',
    hotstar: '/logos/hotstar.png',
    zee5: '/logos/zee5.png',
    netflix: '/logos/netflix.png',
    sony_liv: '/logos/sonyliv.png',
    spotify: '/logos/spotify.png',
    apple_music: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/960px-Apple_Music_icon.svg.png',
    youtube_music: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/YouTubeMusic_Logo.png',
    jiosaavn: '/logos/jiosaavn.png',
  };
  const shouldShowLogo =
    movie?.title_logo_url &&
    movie.title_logo_url.trim() !== '' &&
    !movie.use_text_title;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pb-10">
        <div className="px-4 pt-4">
          <div className="relative w-full h-[220px] rounded-md overflow-hidden bg-black">
            {videoId && !videoError ? (
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
            ) : (
              <img
                loading="lazy"
                src={movie.backdrop_url || movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
        <section className="rounded-md overflow-hidden border border-gray-800 bg-[#1a1a1a] mt-4">
          <div className="p-4">
            <div className="flex gap-3">
              {movie.poster_url && (
                <img loading="lazy"
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-[120px] h-[170px] object-cover rounded-md shadow"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center min-h-[48px]">
                  {shouldShowLogo ? (
                    <img
                      src={movie.title_logo_url}
                      alt={movie.title}
                      className="max-h-12 w-auto object-contain"
                    />
                  ) : (
                    <h1 className="text-xl font-bold text-white">{movie.title}</h1>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-400">{metaLine || 'Details unavailable'}</div>
                <div className="mt-3 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#F5C518] text-black text-sm font-semibold">
                  {typeof movie.rating === 'number' ? movie.rating.toFixed(1) : 'NR'}
                </div>
                {movie.imdb_rating && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="bg-[#F5C518] text-black font-bold px-3 py-1 rounded-md text-sm">
                      IMDb {movie.imdb_rating}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-6">
          <div className="flex flex-col gap-3">
            {movie.trailer_url && (
              <button className="btn-primary h-11 w-full" onClick={() => window.open(movie.trailer_url, '_blank')}>
                Watch Trailer
              </button>
            )}
            <button className="btn-secondary h-11 w-full" onClick={toggleWatchlist}>
              {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </button>
          </div>
        </section>

        {movie.overview && (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Storyline</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              {showFullOverview ? movie.overview : movie.overview.slice(0, 180)}
              {movie.overview.length > 180 && !showFullOverview ? '...' : ''}
            </p>
            {movie.overview.length > 180 && (
              <button className="mt-2 text-sm text-gray-400 hover:text-white transition" onClick={() => setShowFullOverview(!showFullOverview)}>
                {showFullOverview ? 'Read Less' : 'Read More'}
              </button>
            )}
          </section>
        )}

        {movie.cast?.length > 0 && (
          <section className="py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Cast</h2>
              <span className="text-sm text-[#F5C518]">See All</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {movie.cast.slice(0, 12).map((c) => (
                <div key={`cast-${c.id}`} className="min-w-[90px] text-center">
                  {c.person?.profile_url ? (
                    <img loading="lazy" src={c.person.profile_url} alt={c.person.name} className="w-16 h-16 rounded-full object-cover mx-auto" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto text-xs">
                      {c.person?.name?.[0] || '?'}
                    </div>
                  )}
                  <button onClick={() => navigate(`/person/${c.person.id}`)} className="mt-2 text-xs font-medium">
                    {c.person?.name}
                  </button>
                  <div className="text-xs text-gray-400">{c.character}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(movie.crew || []).length > 0 && (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Crew</h2>
            <div className="space-y-3">
              {(movie.crew || []).map((member) => (
                <button
                  key={member.id}
                  className="w-full flex items-center gap-3 text-left"
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
                    <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs">
                      {member.person?.name?.[0] || '?'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-white">{member.person?.name}</p>
                    <p className="text-xs text-gray-400">{member.job || 'Crew'}</p>
                  </div>
                </button>
              ))}
            </div>
            {movie.composer_name && (
              <div className="mt-4 text-sm text-gray-300">
                <span className="text-gray-400">Music:</span> {movie.composer_name}
              </div>
            )}
          </section>
        )}

        {ottPlatforms.length > 0 && (
          <section className="px-4 mt-8">
            <h2 className="text-lg font-semibold mb-4">Watch On</h2>
            <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
              {ottPlatforms.map(([platform, url]) => {
                const logoSrc = platformLogos[platform];
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[80px] flex flex-col items-center"
                  >
                    <div className="w-16 h-16 bg-[#111] rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition">
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={platform}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <span className="text-xs text-white capitalize">
                          {platform.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {musicPlatforms.length > 0 && (
          <section className="px-4 mt-8">
            <h2 className="text-lg font-semibold mb-4">Listen On</h2>
            <div className="flex gap-5 overflow-x-auto pb-2 no-scrollbar">
              {musicPlatforms.map(([platform, url]) => {
                const logoSrc = platformLogos[platform];
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-[80px] flex flex-col items-center"
                  >
                    <div className="w-16 h-16 bg-[#111] rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition">
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={platform}
                          className="w-10 h-10 object-contain"
                        />
                      ) : (
                        <span className="text-xs text-white capitalize">
                          {platform.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Ratings & Reviews</h2>
          <div className="text-sm text-gray-300 mb-3">
            <span className="text-[#F5C518] font-semibold">User Rating:</span>{' '}
            {typeof movie.rating === 'number' ? `${movie.rating.toFixed(1)} / 10` : 'NR'}
          </div>
          <div className="space-y-3">
            {reviewItems.length > 0 ? (
              reviewItems.slice(0, 2).map((review, idx) => (
                <div key={`review-${idx}`} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{review.username || 'User'}</span>
                    <span className="text-[#F5C518]">{review.rating || 'NR'}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{review.text || 'Review unavailable.'}</p>
                  {review.spoiler && (
                    <span className="mt-2 inline-block text-xs bg-[#2a2a2a] px-2 py-0.5 rounded-md">Spoiler</span>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3 text-sm text-gray-400">
                No reviews yet.
              </div>
            )}
          </div>
          <button className="mt-3 text-sm text-gray-400 hover:text-white transition">See All Reviews</button>
        </section>

        {(mediaVideos.length > 0 || mediaPhotos.length > 0) && (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Media</h2>
            <div className="grid grid-cols-2 gap-3">
              {mediaVideos.map((url) => (
                <button
                  key={url}
                  className="aspect-video rounded-md overflow-hidden bg-[#1a1a1a] border border-gray-800 flex items-center justify-center text-sm"
                  onClick={() => window.open(url, '_blank')}
                >
                  Play Video
                </button>
              ))}
              {mediaPhotos.map((url) => (
                <div key={url} className="aspect-video rounded-md overflow-hidden bg-[#1a1a1a] border border-gray-800">
                  <img loading="lazy" src={url} alt="Media" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Similar Movies</h2>
          <div className="grid grid-cols-2 gap-3">
            {movie.similar_movies?.length ? (
              movie.similar_movies.slice(0, 6).map((item) => (
                <button
                  key={`similar-${item.id}`}
                  className="text-left"
                  onClick={() => navigate(`/movie/${item.id}`)}
                >
                  <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[#1a1a1a] border border-gray-800">
                    {typeof item.rating === 'number' && (
                      <div className="absolute top-2 left-2 bg-[#F5C518] text-black text-xs font-semibold px-2 py-0.5 rounded">
                        {item.rating.toFixed(1)}
                      </div>
                    )}
                    <img loading="lazy" src={item.poster_url || item.backdrop_url} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="mt-2 text-sm font-medium truncate">{item.title}</p>
                </button>
              ))
            ) : (
              <div className="col-span-2 text-sm text-gray-400">No similar movies available.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );


};

export default MovieDetail;
