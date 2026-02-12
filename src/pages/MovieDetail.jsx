import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById, updateMovie } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { useWatchlist } from '../hooks/useWatchlist';
import CastCard from '../components/CastCard';
import DetailHero from '../components/DetailHero';
import MusicPlatforms from '../components/MusicPlatforms';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { addItem, removeItem, checkInWatchlist } = useWatchlist();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [editingPoster, setEditingPoster] = useState(false);
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [editingBackdrop, setEditingBackdrop] = useState(false);

  const getYouTubeThumbnail = (url) => {
    const videoId = url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const formatRuntime = (runtimeMinutes) => {
    if (!runtimeMinutes || runtimeMinutes <= 0) return null;
    const hours = Math.floor(runtimeMinutes / 60);
    const minutes = runtimeMinutes % 60;
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
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
    if (!user) {
      navigate('/login');
      return;
    }
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
      <DetailHero backdrop={movie.backdrop_url} poster={movie.poster_url} title={movie.title} />

      {/* Title Section */}
      <div className="mt-16 md:mt-24 text-center px-4">
        <p className="text-sky-300 text-xs uppercase tracking-[0.3em]">Movie</p>
        <h1 className="text-3xl md:text-5xl font-semibold text-white mt-3">
          {movie.title}{' '}
          <span className="text-gray-400">
            {movie.release_date && `(${movie.release_date.split('-')[0]})`}
          </span>
        </h1>

        <div className="flex items-center justify-center gap-3 text-sm md:text-base mb-6 flex-wrap text-gray-300 mt-4">
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center">
              {movie.genres.slice(0, 3).map((genre, i) => (
                <button key={i} onClick={() => navigate(`/movies?genre=${genre}`)} className="chip">
                  {genre}
                </button>
              ))}
            </div>
          )}
          {movie.runtime > 0 && (
            <>
              <span className="meta-separator">•</span>
              <span className="text-sm md:text-base font-medium text-gray-300/90">{formatRuntime(movie.runtime)}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <button onClick={toggleWatchlist} className="btn-ghost">
            {inWatchlist ? 'In Watchlist' : '+ Add to Watchlist'}
          </button>
          {movie.trailer_url && (
            <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
              Watch Trailer
            </a>
          )}
          {movie.is_now_showing && movie.booking_url && (
            <button
              onClick={() => window.open(movie.booking_url, '_blank', 'noopener,noreferrer')}
              className="btn-ticket inline-flex items-center gap-2 whitespace-nowrap"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/75/Bookmyshow-logoid.png"
                alt="Ticket"
                className="ticket-logo"
                loading="lazy"
                decoding="async"
              />
            </button>
          )}
          {isAdmin && (
            <>
              <button onClick={() => { setEditingPoster(true); setPosterUrl(movie.poster_url || ''); }} className="btn-ghost">
                Edit Poster
              </button>
              <button onClick={() => { setEditingBackdrop(true); setBackdropUrl(movie.backdrop_url || ''); }} className="btn-ghost">
                Edit Backdrop
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content: 8-col + 4-col sidebar */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8">
        {/* Tab Navigation */}
        <nav className="border-b border-white/10 mb-8">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            <button onClick={() => setActiveTab('overview')} className={`tab-item ${activeTab === 'overview' ? 'tab-item-active' : ''}`}>
              Overview
            </button>
            <button onClick={() => setActiveTab('cast')} className={`tab-item ${activeTab === 'cast' ? 'tab-item-active' : ''}`}>
              Cast
            </button>
            <button onClick={() => setActiveTab('crew')} className={`tab-item ${activeTab === 'crew' ? 'tab-item-active' : ''}`}>
              Crew
            </button>
            <button onClick={() => setActiveTab('links')} className={`tab-item ${activeTab === 'links' ? 'tab-item-active' : ''}`}>
              Links
            </button>
          </div>
        </nav>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8 overflow-hidden">
            {activeTab === 'overview' && movie.overview && (
              <section className="glass-card p-6">
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <p className={`text-gray-300 leading-relaxed ${!showFullOverview ? 'md:line-clamp-3 line-clamp-4' : ''}`}>
                  {movie.overview}
                </p>
                {movie.overview.length > 200 && (
                  <button 
                    onClick={() => setShowFullOverview(!showFullOverview)}
                    className="text-sky-400 hover:text-sky-300 text-sm mt-3 transition"
                  >
                    {showFullOverview ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </section>
            )}

            {activeTab === 'cast' && (
              <section>
                <h2 className="text-2xl font-semibold mb-6">Cast</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
                  {movie.cast?.map((c) => (
                    <CastCard key={c.id} person={c.person} role={c.character} personId={c.person.id} />
                  ))}
                </div>
                {(!movie.cast || movie.cast.length === 0) && (
                  <p className="text-center text-gray-400 py-12">No cast information available</p>
                )}
              </section>
            )}

            {activeTab === 'crew' && (
              <section>
                <h2 className="text-2xl font-semibold mb-6">Crew</h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
                  {movie.crew?.map((c) => (
                    <CastCard key={c.id} person={c.person} role={c.job} personId={c.person.id} />
                  ))}
                </div>
                {(!movie.crew || movie.crew.length === 0) && (
                  <p className="text-center text-gray-400 py-12">No crew information available</p>
                )}
              </section>
            )}

            {activeTab === 'links' && (
              <div className="space-y-8">
                {movie.trailer_url && (
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">Trailer</h2>
                    <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer" className="block relative group">
                      <img
                        src={getYouTubeThumbnail(movie.trailer_url) || movie.backdrop_url || 'https://via.placeholder.com/640x360'}
                        alt="Trailer"
                        className="w-full rounded-2xl border border-white/10"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition rounded-2xl">
                        <div className="w-16 h-16 bg-sky-400 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                          <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  </section>
                )}

                {movie.telegram_link && (
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">Download</h2>
                    <a href={movie.telegram_link} target="_blank" rel="noopener noreferrer" className="btn-ghost inline-block">
                      Download on Telegram
                    </a>
                  </section>
                )}

                {movie.music_links && (movie.music_links.spotify || movie.music_links.apple_music || movie.music_links.youtube_music) && (
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">Soundtrack</h2>
                    <MusicPlatforms
                      spotifyUrl={movie.music_links.spotify}
                      appleMusicUrl={movie.music_links.apple_music}
                      youtubeMusicUrl={movie.music_links.youtube_music}
                    />
                  </section>
                )}
              </div>
            )}
          </div>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Ratings Card */}
            {((typeof movie.rating === 'number') || (typeof movie.imdb_rating === 'number') || (typeof movie.rotten_rating === 'number')) && (
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4 text-lg">Ratings</h3>
                <div className="space-y-3">
                  {typeof movie.rating === 'number' && (
                    <div className="flex items-center gap-3">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tmdb.new.logo.svg/3840px-Tmdb.new.logo.svg.png"
                        alt="TMDB"
                        className="h-6 w-auto"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="text-lg font-semibold">{movie.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {typeof movie.imdb_rating === 'number' && (
                    <div className="flex items-center gap-3">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/IMDB_Logo_2016.svg/960px-IMDB_Logo_2016.svg.png"
                        alt="IMDb"
                        className="h-5 w-auto"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="text-lg font-semibold">{movie.imdb_rating.toFixed(1)}</span>
                    </div>
                  )}
                  {typeof movie.rotten_rating === 'number' && (
                    <div className="flex items-center gap-3">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Rotten_Tomatoes.svg/3840px-Rotten_Tomatoes.svg.png"
                        alt="Rotten Tomatoes"
                        className="h-5 w-5"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="text-lg font-semibold">{Math.round(movie.rotten_rating)}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Streaming Platforms Card */}
            {movie.watch_links && (movie.watch_links.netflix || movie.watch_links.prime || movie.watch_links.hotstar || movie.watch_links.zee5 || movie.watch_links.sonyliv) && (
              <div className="glass-card p-6">
                <h3 className="font-semibold mb-4 text-lg">Watch Now</h3>
                <div className="flex flex-col gap-3">
                  {movie.watch_links.netflix && (
                    <a href={movie.watch_links.netflix} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 rounded-xl bg-[#E50914] hover:bg-[#f6121d] text-white transition">
                      <img src="https://www.edigitalagency.com.au/wp-content/uploads/netflix-logo-black-png-900x244.png" alt="Netflix" className="h-6 w-auto" loading="lazy" decoding="async" />
                    </a>
                  )}
                  {movie.watch_links.prime && (
                    <a href={movie.watch_links.prime} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 rounded-xl bg-[#1B4DB1] hover:bg-[#225dd6] text-white transition">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/960px-Amazon_Prime_Video_logo.svg.png" alt="Prime Video" className="h-6 w-auto" loading="lazy" decoding="async" />
                    </a>
                  )}
                  {movie.watch_links.hotstar && (
                    <a href={movie.watch_links.hotstar} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 rounded-xl bg-[#0B5FFF] hover:bg-[#1b6dff] text-white transition">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/4/40/JioHotstar_2025.png" alt="JioHotstar" className="h-7 w-auto" loading="lazy" decoding="async" />
                    </a>
                  )}
                  {movie.watch_links.sonyliv && (
                    <a href={movie.watch_links.sonyliv} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 rounded-xl bg-[#1F1F1F] hover:bg-[#2a2a2a] text-white transition">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/f/f7/SonyLIV_2020.png" alt="SonyLIV" className="h-6 w-auto" loading="lazy" decoding="async" />
                    </a>
                  )}
                  {movie.watch_links.zee5 && (
                    <a href={movie.watch_links.zee5} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-3 rounded-xl bg-[#2B2B2B] hover:bg-[#3a3a3a] text-white transition">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/ZEE5_2025.svg/250px-ZEE5_2025.svg.png" alt="ZEE5" className="h-6 w-auto" loading="lazy" decoding="async" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Quick Info Card */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 text-lg">Info</h3>
              <div className="space-y-3 text-sm">
                {movie.release_date && (
                  <div>
                    <span className="text-gray-400">Release Date</span>
                    <p className="text-white font-medium">{new Date(movie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
                {movie.runtime > 0 && (
                  <div>
                    <span className="text-gray-400">Runtime</span>
                    <p className="text-white font-medium">{formatRuntime(movie.runtime)}</p>
                  </div>
                )}
                {movie.genres && movie.genres.length > 0 && (
                  <div>
                    <span className="text-gray-400">Genres</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {movie.genres.map((genre, i) => (
                        <button key={i} onClick={() => navigate(`/movies?genre=${genre}`)} className="chip">
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Edit Modals */}
      {editingPoster && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setEditingPoster(false)}>
          <div className="glass-card rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Update Poster</h3>
            {posterUrl && (
              <div className="mb-4 flex justify-center">
                <img src={posterUrl} alt="Preview" className="w-32 h-48 object-cover rounded-lg" onError={(e) => (e.target.style.display = 'none')} />
              </div>
            )}
            <input type="url" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="Poster URL" className="w-full px-4 py-2 glass-input mb-4" />
            <div className="flex gap-3">
              <button onClick={async () => { await updateMovie(movie.id, { poster_url: posterUrl }); setEditingPoster(false); loadMovie(); }} className="btn-primary flex-1">
                Save
              </button>
              <button onClick={() => setEditingPoster(false)} className="btn-ghost flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingBackdrop && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setEditingBackdrop(false)}>
          <div className="glass-card rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold mb-4">Update Backdrop</h3>
            {backdropUrl && (
              <div className="mb-4">
                <img src={backdropUrl} alt="Preview" className="w-full h-32 object-cover rounded-lg" onError={(e) => (e.target.style.display = 'none')} />
              </div>
            )}
            <input type="url" value={backdropUrl} onChange={(e) => setBackdropUrl(e.target.value)} placeholder="Backdrop URL" className="w-full px-4 py-2 glass-input mb-4" />
            <div className="flex gap-3">
              <button onClick={async () => { await updateMovie(movie.id, { backdrop_url: backdropUrl }); setEditingBackdrop(false); loadMovie(); }} className="btn-primary flex-1">
                Save
              </button>
              <button onClick={() => setEditingBackdrop(false)} className="btn-ghost flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
