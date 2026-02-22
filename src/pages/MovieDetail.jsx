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

  return (
    <div>
      <section className="relative h-[70vh] w-full overflow-hidden bg-black">
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

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
            {movie.poster_url && (
              <div className="shrink-0">
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-28 sm:w-36 md:w-48 aspect-[2/3] rounded-xl object-cover shadow-2xl"
                />
              </div>
            )}
            <div className="flex flex-col gap-3 max-w-2xl">
              {movie.title_logo_url ? (
                <img className="max-w-[240px] w-full" src={movie.title_logo_url} alt={movie.title} />
              ) : (
                <h1 className="text-2xl sm:text-3xl font-semibold">{movie.title}</h1>
              )}
              <div className="text-xs sm:text-sm text-gray-300 flex flex-wrap items-center gap-2">
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
                <div className="text-sm text-gray-300 leading-relaxed">
                  <p>
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

              <div className="flex flex-wrap gap-3">
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

      {(directors.length > 0 || writers.length > 0) && (
        <section className="section credit-block">
          {directors.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div className="credit-name">{directors[0].person?.name}</div>
              <div className="credit-role">Director</div>
            </div>
          )}
          {writers.length > 0 && (
            <div>
              <div className="credit-name">{writers[0].person?.name}</div>
              <div className="credit-role">Writer</div>
            </div>
          )}
        </section>
      )}

      {movie.cast?.length > 0 && (
        <section className="section">
          <h2 className="section-title">Cast</h2>
          <div className="cast-row">
            {movie.cast.slice(0, 15).map((c) => (
              <div key={`cast-${c.id}`} className="cast-card">
                {c.person?.profile_url ? (
                  <img src={c.person.profile_url} alt={c.person.name} className="cast-image" />
                ) : (
                  <div className="cast-image cast-avatar-fallback">{c.person?.name?.[0] || '?'}</div>
                )}
                <button onClick={() => navigate(`/person/${c.person.id}`)} className="cast-name">
                  {c.person?.name}
                </button>
                <div className="cast-role">{c.character}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {movie.crew?.length > 0 && (
        <section className="section">
          <h2 className="section-title">Crew</h2>
          <div className="cast-row">
            {movie.crew.slice(0, 15).map((c) => (
              <div key={`crew-${c.id}`} className="cast-card">
                {c.person?.profile_url ? (
                  <img src={c.person.profile_url} alt={c.person.name} className="cast-image" />
                ) : (
                  <div className="cast-image cast-avatar-fallback">{c.person?.name?.[0] || '?'}</div>
                )}
                <button onClick={() => navigate(`/person/${c.person.id}`)} className="cast-name">
                  {c.person?.name}
                </button>
                <div className="cast-role">{c.job}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {platforms.length > 0 && (
        <section className="section">
          <h2 className="section-title">Platforms</h2>
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
        <section className="section">
          <h2 className="section-title">Music Platforms</h2>
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
  );
};

export default MovieDetail;

