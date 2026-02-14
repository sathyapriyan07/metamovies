import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, updateMovie } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../hooks/useWatchlist';
import CastCard from '../components/CastCard';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { addItem, removeItem, checkInWatchlist } = useWatchlist();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);

  const formatRuntime = (mins) => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 && m > 0 ? `${h}h ${m}m` : h > 0 ? `${h}h` : `${m}m`;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-sky-400"></div>
      </div>
    );
  }

  if (!movie) return <div className="min-h-screen flex items-center justify-center">Movie not found</div>;

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      {/* Hero Section - Mobile Optimized */}
      <div className="relative w-full h-[45vh] md:h-[50vh] overflow-hidden">
        <img
          src={movie.backdrop_url || movie.poster_url}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#04060b] via-black/70 to-transparent" />
        
        <div className="relative h-full flex items-end pb-6 px-5">
          <div className="w-full">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 tracking-tight leading-tight">
              {movie.title}
            </h1>
            
            <div className="flex items-center gap-2 text-xs text-gray-300 flex-wrap mb-4">
              {movie.release_date && <span>{movie.release_date.split('-')[0]}</span>}
              {movie.genres?.length > 0 && (
                <>
                  <span>•</span>
                  <span>{movie.genres.slice(0, 2).join(', ')}</span>
                </>
              )}
              {movie.runtime > 0 && (
                <>
                  <span>•</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-5 py-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {movie.is_now_showing && movie.booking_url && (
          <button
            onClick={() => window.open(movie.booking_url, '_blank')}
            className="px-6 py-2.5 rounded-full font-semibold bg-gradient-to-r from-[#1e8bff] to-[#4fd1ff] shadow-[0_8px_20px_rgba(40,133,255,0.35)] transition-all duration-300 hover:scale-[1.02] whitespace-nowrap"
          >
            Book Tickets
          </button>
        )}
        {movie.trailer_url && (
          <button
            onClick={() => window.open(movie.trailer_url, '_blank')}
            className="px-5 py-2.5 rounded-full font-medium border border-white/20 bg-white/10 backdrop-blur transition-all duration-300 hover:bg-white/20 whitespace-nowrap"
          >
            Watch Trailer
          </button>
        )}
        <button
          onClick={toggleWatchlist}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
        >
          <svg className="w-5 h-5" fill={inWatchlist ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        <button
          onClick={() => navigator.share?.({ title: movie.title, url: window.location.href })}
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      <div className="px-5 space-y-5 mt-2">
        {/* Overview Card */}
        {movie.overview && (
          <div className="glass-card p-5 rounded-2xl">
            <p className={`text-gray-300 text-sm leading-relaxed ${!showFullOverview ? 'line-clamp-4' : ''}`}>
              {movie.overview}
            </p>
            {movie.overview.length > 200 && (
              <button
                onClick={() => setShowFullOverview(!showFullOverview)}
                className="text-[#3ba7ff] hover:text-[#5dd1ff] text-sm mt-3 font-medium transition"
              >
                {showFullOverview ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        )}

        {/* Ratings & Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Ratings Card */}
          {(typeof movie.rating === 'number' || typeof movie.imdb_rating === 'number') && (
            <div className="glass-card p-4 rounded-2xl">
              <h3 className="font-semibold mb-3 text-sm text-gray-400">Ratings</h3>
              <div className="space-y-2.5">
                {typeof movie.rating === 'number' && (
                  <div className="flex items-center gap-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tmdb.new.logo.svg/3840px-Tmdb.new.logo.svg.png"
                      alt="TMDB"
                      className="h-5 w-auto"
                    />
                    <span className="text-base font-semibold">{movie.rating.toFixed(1)}</span>
                  </div>
                )}
                {typeof movie.imdb_rating === 'number' && (
                  <div className="flex items-center gap-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/960px-IMDB_Logo_2016.svg.png"
                      alt="IMDb"
                      className="h-4 w-auto"
                    />
                    <span className="text-base font-semibold">{movie.imdb_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="glass-card p-4 rounded-2xl">
            <h3 className="font-semibold mb-3 text-sm text-gray-400">Info</h3>
            <div className="space-y-2 text-xs">
              {movie.release_date && (
                <div>
                  <p className="text-gray-400">Release</p>
                  <p className="text-white font-medium">{new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>
                </div>
              )}
              {movie.runtime > 0 && (
                <div>
                  <p className="text-gray-400">Runtime</p>
                  <p className="text-white font-medium">{formatRuntime(movie.runtime)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {movie.cast?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Cast</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
              {movie.cast.slice(0, 10).map((c) => (
                <div key={c.id} className="flex-shrink-0 snap-start">
                  <div
                    onClick={() => navigate(`/person/${c.person.id}`)}
                    className="w-[72px] md:w-[88px] cursor-pointer"
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-full bg-white/10 mb-2">
                      {c.person.profile_url ? (
                        <img
                          src={c.person.profile_url}
                          alt={c.person.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-center line-clamp-2 leading-tight">{c.person.name}</p>
                    <p className="text-[10px] text-gray-400 text-center line-clamp-1">{c.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crew Section */}
        {movie.crew?.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Crew</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
              {movie.crew.slice(0, 10).map((c) => (
                <div key={c.id} className="flex-shrink-0 snap-start">
                  <div
                    onClick={() => navigate(`/person/${c.person.id}`)}
                    className="w-[72px] md:w-[88px] cursor-pointer"
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-full bg-white/10 mb-2">
                      {c.person.profile_url ? (
                        <img
                          src={c.person.profile_url}
                          alt={c.person.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-center line-clamp-2 leading-tight">{c.person.name}</p>
                    <p className="text-[10px] text-gray-400 text-center line-clamp-1">{c.job}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streaming Platforms */}
        {movie.watch_links && (movie.watch_links.netflix || movie.watch_links.prime || movie.watch_links.hotstar || movie.watch_links.zee5) && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Watch Now</h2>
            <div className="grid grid-cols-2 gap-3">
              {movie.watch_links.netflix && (
                <a
                  href={movie.watch_links.netflix}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-3.5 rounded-2xl bg-[#E50914] hover:bg-[#f6121d] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(229,9,20,0.4)]"
                >
                  <img src="https://www.edigitalagency.com.au/wp-content/uploads/netflix-logo-black-png-900x244.png" alt="Netflix" className="h-5 w-auto" />
                </a>
              )}
              {movie.watch_links.prime && (
                <a
                  href={movie.watch_links.prime}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-3.5 rounded-2xl bg-[#1B4DB1] hover:bg-[#225dd6] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(27,77,177,0.4)]"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/960px-Amazon_Prime_Video_logo.svg.png" alt="Prime" className="h-5 w-auto" />
                </a>
              )}
              {movie.watch_links.hotstar && (
                <a
                  href={movie.watch_links.hotstar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-3.5 rounded-2xl bg-[#0B5FFF] hover:bg-[#1b6dff] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(11,95,255,0.4)]"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/JioHotstar_2025.png" alt="JioHotstar" className="h-6 w-auto" />
                </a>
              )}
              {movie.watch_links.zee5 && (
                <a
                  href={movie.watch_links.zee5}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-4 py-3.5 rounded-2xl bg-[#2B2B2B] hover:bg-[#3a3a3a] transition-all duration-300"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/ZEE5_2025.svg/250px-ZEE5_2025.svg.png" alt="ZEE5" className="h-5 w-auto" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Genres */}
        {movie.genres?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3 text-gray-400">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre, i) => (
                <button
                  key={i}
                  onClick={() => navigate(`/movies?genre=${genre}`)}
                  className="px-4 py-1.5 rounded-full text-xs font-medium border border-white/15 bg-white/5 text-gray-200 transition-all duration-300 hover:border-[#3ba7ff]/50 hover:bg-[#3ba7ff]/10"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
