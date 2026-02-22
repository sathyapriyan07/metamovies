import { useEffect, useState } from 'react';
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
  const [showAllCast, setShowAllCast] = useState(false);
  const [showAllCrew, setShowAllCrew] = useState(false);

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

  if (loading) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found</p>;

  const platforms = (movie.movie_platforms || [])
    .map((entry) => entry.platform)
    .filter(Boolean);

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
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&?/]{11})/i);
    return match ? match[1] : null;
  };
  const isVideoFile = (url) => /\.(mp4|webm|ogg|m3u8)(\?|#|$)/i.test(url || '');
  const directors = (movie.crew || []).filter((c) => c?.job === 'Director');
  const writers = (movie.crew || []).filter((c) => ['Writer', 'Screenplay'].includes(c?.job));
  const combinedPeople = [
    ...(movie.cast || []).map((c) => ({
      key: `cast-${c.id}`,
      person: c.person,
      role: c.character,
    })),
    ...(movie.crew || []).map((c) => ({
      key: `crew-${c.id}`,
      person: c.person,
      role: c.job,
    })),
  ];
  const visibleCast = showAllCast ? (movie.cast || []) : (movie.cast || []).slice(0, 6);
  const visibleCrew = showAllCrew ? (movie.crew || []) : (movie.crew || []).slice(0, 6);

  return (
    <div>
      <section className="relative w-screen h-[85vh] overflow-hidden">
        {movie.trailer_url ? (
          (() => {
            const yt = getYouTubeId(movie.trailer_url);
            if (yt) {
              return (
                <iframe
                  className="absolute inset-0 h-full w-full object-cover"
                  src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt}&playsinline=1&modestbranding=1&rel=0`}
                  title={`${movie.title} trailer`}
                  allow="autoplay; encrypted-media; fullscreen"
                  frameBorder="0"
                />
              );
            }
            if (isVideoFile(movie.trailer_url)) {
              return (
                <video className="absolute inset-0 h-full w-full object-cover" src={movie.trailer_url} autoPlay muted loop playsInline />
              );
            }
            return <img className="absolute inset-0 h-full w-full object-cover" src={movie.backdrop_url || movie.poster_url} alt={movie.title} />;
          })()
        ) : (
          <img className="absolute inset-0 h-full w-full object-cover" src={movie.backdrop_url || movie.poster_url} alt={movie.title} />
        )}

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 h-full flex flex-col justify-end max-w-7xl mx-auto px-6 pb-16">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-6">
            {movie.poster_url && (
              <div className="shrink-0">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-28 sm:w-36 md:w-48 aspect-[2/3] rounded-xl object-cover shadow-2xl"
                />
              </div>
            )}
            <div className="flex flex-col space-y-4 max-w-2xl">
              {movie.title_logo_url ? (
                <img className="w-48 sm:w-64 md:w-72 object-contain" src={movie.title_logo_url} alt={movie.title} />
              ) : (
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">{movie.title}</h1>
              )}
              <div className="text-sm text-gray-400 flex flex-wrap items-center gap-2">
                <span>{year}</span>
                {runtime ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gray-400" aria-hidden="true" />
                    <span>{runtime}</span>
                  </>
                ) : null}
                {movie.genres?.length > 0 ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gray-400" aria-hidden="true" />
                    <span>{movie.genres.join(' • ')}</span>
                  </>
                ) : null}
              </div>

              {movie.overview && (
                <div className="text-base text-gray-300 leading-relaxed">
                  <p className="text-base text-gray-300 leading-relaxed">
                    {showFullOverview ? movie.overview : movie.overview.slice(0, 300)}
                    {movie.overview.length > 300 && !showFullOverview ? '...' : ''}
                  </p>
                  {movie.overview.length > 300 && (
                    <button
                      className="mt-2 text-xs text-white/80 hover:text-white transition"
                      onClick={() => setShowFullOverview(!showFullOverview)}
                    >
                      {showFullOverview ? 'Less' : 'More'}
                    </button>
                  )}
                </div>
              )}

              <div className="mt-6 flex gap-4">
                {movie.trailer_url && (
                  <button className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium" onClick={() => window.open(movie.trailer_url, '_blank')}>
                    Watch Trailer
                  </button>
                )}
                <button className="px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium" onClick={toggleWatchlist}>
                  {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full">
        <div className="max-w-7xl mx-auto px-6 py-10">
        {(directors.length > 0 || writers.length > 0) && (
          <section className="space-y-6">
            {directors.length > 0 && (
              <div>
                <p
                  className="text-base font-medium cursor-pointer hover:text-white transition"
                  onClick={() => navigate(`/person/${directors[0].person?.id}`)}
                >
                  {directors[0].person?.name}
                </p>
                <div className="text-sm text-gray-400">Director</div>
              </div>
            )}
            {writers.length > 0 && (
              <div>
                <p
                  className="text-base font-medium cursor-pointer hover:text-white transition"
                  onClick={() => navigate(`/person/${writers[0].person?.id}`)}
                >
                  {writers[0].person?.name}
                </p>
                <div className="text-sm text-gray-400">Writer</div>
              </div>
            )}
          </section>
        )}

        {movie.cast?.length > 0 && (
          <section className="mt-12 space-y-6">
            <h2 className="text-xl font-semibold">Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
              {visibleCast.map((c) => (
                <div key={`cast-${c.id}`} className="flex flex-col items-center text-center space-y-2">
                  {c.person?.profile_url ? (
                    <img src={c.person.profile_url} alt={c.person.name} className="w-20 h-20 rounded-xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center">
                      {c.person?.name?.[0] || '?'}
                    </div>
                  )}
                  <button onClick={() => navigate(`/person/${c.person.id}`)} className="text-sm font-medium">
                    {c.person?.name}
                  </button>
                  <div className="text-xs text-gray-400">{c.character}</div>
                </div>
              ))}
            </div>
            {movie.cast.length > 6 && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAllCast(!showAllCast)}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  {showAllCast ? 'View Less' : 'View More'}
                </button>
              </div>
            )}
          </section>
        )}

        {movie.crew?.length > 0 && (
          <section className="mt-12 space-y-6">
            <h2 className="text-xl font-semibold">Crew</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
              {visibleCrew.map((c) => (
                <div key={`crew-${c.id}`} className="flex flex-col items-center text-center space-y-2">
                  {c.person?.profile_url ? (
                    <img src={c.person.profile_url} alt={c.person.name} className="w-20 h-20 rounded-xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center">
                      {c.person?.name?.[0] || '?'}
                    </div>
                  )}
                  <button onClick={() => navigate(`/person/${c.person.id}`)} className="text-sm font-medium">
                    {c.person?.name}
                  </button>
                  <div className="text-xs text-gray-400">{c.job}</div>
                </div>
              ))}
            </div>
            {movie.crew.length > 6 && (
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAllCrew(!showAllCrew)}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  {showAllCrew ? 'View Less' : 'View More'}
                </button>
              </div>
            )}
          </section>
        )}

        {platforms.length > 0 && (
          <section className="mt-12 space-y-6">
            <h2 className="text-xl font-semibold">Platforms</h2>
            <div className="tabs">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  className="tab platform-tab"
                  onClick={() => navigate(`/platforms/${platform.id}`)}
                >
                  {platform.logo_url && (
                    <img src={platform.logo_url} alt={platform.name} className="platform-logo" />
                  )}
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {movie.music_links && (movie.music_links.spotify || movie.music_links.apple_music || movie.music_links.youtube_music || movie.music_links.amazon_music) && (
          <section className="mt-12 space-y-6">
            <h2 className="text-xl font-semibold">Music Platforms</h2>
            <div className="tabs">
              {movie.music_links.spotify && (
                <a className="tab active platform-tab" href={movie.music_links.spotify} target="_blank" rel="noopener noreferrer">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" alt="Spotify" className="platform-logo" />
                  <span>Spotify</span>
                </a>
              )}
              {movie.music_links.apple_music && (
                <a className="tab active platform-tab" href={movie.music_links.apple_music} target="_blank" rel="noopener noreferrer">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Apple_Music_icon.svg/960px-Apple_Music_icon.svg.png" alt="Apple Music" className="platform-logo" />
                  <span>Apple Music</span>
                </a>
              )}
              {movie.music_links.youtube_music && (
                <a className="tab active platform-tab" href={movie.music_links.youtube_music} target="_blank" rel="noopener noreferrer">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/Youtube_Music_icon.svg" alt="YouTube Music" className="platform-logo" />
                  <span>YouTube Music</span>
                </a>
              )}
              {movie.music_links.amazon_music && (
                <a className="tab active platform-tab" href={movie.music_links.amazon_music} target="_blank" rel="noopener noreferrer">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/7d/Amazon_Music_logo.svg" alt="Amazon Music" className="platform-logo" />
                  <span>Amazon Music</span>
                </a>
              )}
            </div>
          </section>
        )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
