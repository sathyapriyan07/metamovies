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
  const [activeTab, setActiveTab] = useState('cast');
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);

  const getYouTubeThumbnail = (url) => {
    const videoId = url?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600"></div>
      </div>
    );
  }

  if (!movie) return <div className="min-h-screen flex items-center justify-center">Movie not found</div>;

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative w-full h-[65vh] md:h-[80vh] overflow-hidden">
        {/* Backdrop Image */}
        <img
          src={movie.backdrop_url || movie.poster_url || 'https://via.placeholder.com/1920x1080'}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover" 
          style={{ animation: 'fadeIn 0.3s ease-out' }}
        />

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-end pb-12 md:pb-16">
          <div className="max-w-3xl space-y-3 fade-in">
            {/* Title */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {movie.title}
            </h1>

            {/* Rating & Metadata */}
            <div className="flex items-center gap-3 text-sm md:text-base">
              {movie.rating && (
                <span className="text-yellow-400 font-semibold">⭐ {movie.rating.toFixed(1)}</span>
              )}
              {movie.release_date && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300">{movie.release_date.split('-')[0]}</span>
                </>
              )}
              {movie.runtime && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-300">{movie.runtime} min</span>
                </>
              )}
            </div>

            {/* Overview */}
            {movie.overview && (
              <p className="text-gray-400 text-sm md:text-base line-clamp-3 leading-relaxed">
                {movie.overview}
              </p>
            )}

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="text-gray-300 text-sm md:text-base">
                {movie.genres.join(' | ')}
              </div>
            )}

            {/* Watchlist Button */}
            <div className="pt-2">
              <button onClick={toggleWatchlist} className="btn-secondary">
                {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('cast')}
              className={`pb-2 ${activeTab === 'cast' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-400'}`}
            >
              Cast
            </button>
            <button
              onClick={() => setActiveTab('links')}
              className={`pb-2 ${activeTab === 'links' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-400'}`}
            >
              Links
            </button>
            <button
              onClick={() => setActiveTab('crew')}
              className={`pb-2 ${activeTab === 'crew' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-400'}`}
            >
              Crew
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'cast' && (
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {movie.cast?.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/person/${c.person.id}`)}
                    className="cursor-pointer hover:scale-105 transition"
                  >
                    <img
                      src={c.person.profile_url || 'https://via.placeholder.com/200x300'}
                      alt={c.person.name}
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    <p className="font-semibold text-sm">{c.person.name}</p>
                    <p className="text-xs text-gray-400">{c.character}</p>
                  </div>
                ))}
          </div>
        )}

        {activeTab === 'links' && (
              <div className="space-y-8">
                {/* Watch Now */}
                {movie.watch_links && (movie.watch_links.netflix || movie.watch_links.prime || movie.watch_links.hotstar || movie.watch_links.zee5) && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Watch Now</h3>
                    <div className="flex flex-wrap gap-3">
                      {movie.watch_links.netflix && (
                        <a href={movie.watch_links.netflix} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-semibold">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/>
                          </svg>
                          Netflix
                        </a>
                      )}
                      {movie.watch_links.prime && (
                        <a href={movie.watch_links.prime} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5.71 14.37c.01.02.02.04.04.06 1.65 1.28 3.5 2.27 5.49 2.95.08.03.16.05.24.07.16.04.32.08.48.11.08.02.16.03.24.04.16.03.32.05.48.07.08.01.16.02.24.03.16.02.32.03.48.04.08 0 .16.01.24.01.16.01.32.01.48.01s.32 0 .48-.01c.08 0 .16-.01.24-.01.16-.01.32-.02.48-.04.08-.01.16-.02.24-.03.16-.02.32-.04.48-.07.08-.01.16-.03.24-.04.16-.03.32-.07.48-.11.08-.02.16-.04.24-.07 1.99-.68 3.84-1.67 5.49-2.95.02-.02.03-.04.04-.06.01-.01.01-.02.02-.03.01-.02.02-.04.03-.06.01-.02.01-.04.02-.06 0-.02.01-.04.01-.06 0-.02 0-.04.01-.06v-3.5c0-.02 0-.04-.01-.06 0-.02-.01-.04-.01-.06-.01-.02-.01-.04-.02-.06-.01-.02-.02-.04-.03-.06-.01-.01-.01-.02-.02-.03-.01-.02-.02-.04-.04-.06-1.65-1.28-3.5-2.27-5.49-2.95-.08-.03-.16-.05-.24-.07-.16-.04-.32-.08-.48-.11-.08-.02-.16-.03-.24-.04-.16-.03-.32-.05-.48-.07-.08-.01-.16-.02-.24-.03-.16-.02-.32-.03-.48-.04-.08 0-.16-.01-.24-.01-.16-.01-.32-.01-.48-.01s-.32 0-.48.01c-.08 0-.16.01-.24.01-.16.01-.32.02-.48.04-.08.01-.16.02-.24.03-.16.02-.32.04-.48.07-.08.01-.16.03-.24.04-.16.03-.32.07-.48.11-.08.02-.16.04-.24.07-1.99.68-3.84 1.67-5.49 2.95-.02.02-.03.04-.04.06-.01.01-.01.02-.02.03-.01.02-.02.04-.03.06-.01.02-.01.04-.02.06 0 .02-.01.04-.01.06 0 .02 0 .04-.01.06v3.5c0 .02 0 .04.01.06 0 .02.01.04.01.06.01.02.01.04.02.06.01.02.02.04.03.06.01.01.01.02.02.03zm7.79-3.87v5.5c-.16 0-.32 0-.48-.01v-5.48c.16-.01.32-.01.48-.01s.32 0 .48.01v5.48c-.16.01-.32.01-.48.01v-5.5z"/>
                          </svg>
                          Prime Video
                        </a>
                      )}
                      {movie.watch_links.hotstar && (
                        <a href={movie.watch_links.hotstar} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition font-semibold">
                          <span className="text-xl">⭐</span>
                          JioHotstar
                        </a>
                      )}
                      {movie.watch_links.zee5 && (
                        <a href={movie.watch_links.zee5} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-semibold">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18L19.82 8 12 11.82 4.18 8 12 4.18zM4 9.82l7 3.5v7.36l-7-3.5V9.82zm16 0v7.36l-7 3.5v-7.36l7-3.5z"/>
                          </svg>
                          ZEE5
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Trailer */}
                {movie.trailer_url && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Watch Trailer</h3>
                    <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer" className="block relative group">
                      <img
                        src={getYouTubeThumbnail(movie.trailer_url) || movie.backdrop_url || 'https://via.placeholder.com/640x360'}
                        alt="Trailer"
                        className="w-full md:w-2/3 rounded-lg"
                      />
                      <div className="absolute inset-0 md:w-2/3 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition rounded-lg">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition">
                          <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </a>
                  </div>
                )}

                {/* Telegram Download */}
                {movie.telegram_link && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Download</h3>
                    <a
                      href={movie.telegram_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition font-semibold"
                    >
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                      </svg>
                      Download on Telegram
                    </a>
                  </div>
                )}

                {/* Music Platforms */}
                {movie.music_links && (movie.music_links.spotify || movie.music_links.apple_music || movie.music_links.youtube_music) && (
                  <div>
                    <h3 className="text-xl font-bold mb-3">Listen to Soundtrack</h3>
                    <div className="flex flex-wrap gap-3">
                      {movie.music_links.spotify && (
                        <a
                          href={movie.music_links.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                          </svg>
                          Spotify
                        </a>
                      )}
                      {movie.music_links.apple_music && (
                        <a
                          href={movie.music_links.apple_music}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg transition"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.997 6.124c0-.738-.065-1.47-.24-2.19-.317-1.31-1.062-2.31-2.18-3.043C21.003.517 20.373.285 19.7.164c-.517-.093-1.038-.135-1.564-.15-.04-.003-.083-.01-.124-.013H5.988c-.152.01-.303.017-.455.026C4.786.07 4.043.15 3.34.428 2.004.958 1.04 1.88.475 3.208c-.192.448-.292.925-.363 1.408-.056.392-.088.785-.1 1.18 0 .032-.007.062-.01.093v12.223c.01.14.017.283.027.424.05.815.154 1.624.497 2.373.65 1.42 1.738 2.353 3.234 2.801.42.127.856.187 1.293.228.555.053 1.11.06 1.667.06h11.03c.525 0 1.048-.034 1.57-.1.823-.106 1.597-.35 2.296-.81a5.28 5.28 0 0 0 1.88-2.207c.186-.42.293-.87.37-1.324.113-.675.138-1.358.137-2.04-.002-3.8 0-7.595-.003-11.393zm-6.423 3.99v5.712c0 .417-.058.827-.244 1.206-.29.59-.76 1.035-1.36 1.322-.63.302-1.29.405-1.97.332-.655-.07-1.227-.306-1.72-.706-.677-.55-1.03-1.264-1.1-2.107-.08-.98.27-1.85 1.03-2.52.48-.423 1.05-.685 1.68-.816.48-.1.97-.14 1.46-.16.48-.02.96 0 1.51 0v-4.74c0-.068-.007-.127-.048-.188-.05-.075-.11-.087-.19-.08-.48.05-.96.1-1.44.16-1.07.14-2.14.28-3.21.43-.27.04-.55.06-.82.1-.14.02-.27.06-.39.16-.07.06-.09.14-.09.22v8.1c0 .42-.06.83-.25 1.21-.29.59-.76 1.04-1.36 1.33-.63.3-1.29.4-1.97.33-.66-.07-1.23-.31-1.72-.71-.68-.55-1.03-1.27-1.1-2.11-.08-.98.27-1.85 1.03-2.52.48-.42 1.05-.68 1.68-.81.48-.1.97-.14 1.46-.16.48-.02.96 0 1.51 0V6.47c0-.21.03-.21.21-.18.48.06.95.12 1.43.18l2.39.31c.97.13 1.94.26 2.91.39.35.04.71.08 1.06.13.28.04.43.2.43.49v5.29z"/>
                          </svg>
                          Apple Music
                        </a>
                      )}
                      {movie.music_links.youtube_music && (
                        <a
                          href={movie.music_links.youtube_music}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/>
                          </svg>
                          YouTube Music
                        </a>
                      )}
                    </div>
                  </div>
                )}
          </div>
        )}

        {activeTab === 'crew' && (
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {movie.crew?.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/person/${c.person.id}`)}
                    className="cursor-pointer hover:scale-105 transition"
                  >
                    <img
                      src={c.person.profile_url || 'https://via.placeholder.com/200x300'}
                      alt={c.person.name}
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                    <p className="font-semibold text-sm">{c.person.name}</p>
                    <p className="text-xs text-gray-400">{c.job}</p>
                  </div>
                ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
