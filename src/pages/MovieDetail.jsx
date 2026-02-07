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
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[70vh]">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10" />
        <img
          src={movie.backdrop_url || 'https://via.placeholder.com/1920x1080'}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-20">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <img
            src={movie.poster_url || 'https://via.placeholder.com/300x450'}
            alt={movie.title}
            className="w-48 md:w-64 rounded-xl shadow-2xl"
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>
            
            <div className="flex flex-wrap gap-4 mb-4">
              {movie.rating && (
                <span className="text-yellow-400 text-xl">⭐ {movie.rating.toFixed(1)}</span>
              )}
              <span className="text-gray-400">{movie.release_date?.split('-')[0]}</span>
              <span className="text-gray-400">{movie.runtime} min</span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.map((genre, i) => (
                <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">{genre}</span>
              ))}
            </div>

            {/* Overview */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Overview</h2>
              <p className={`text-gray-300 ${!showFullOverview && 'line-clamp-3'}`}>
                {movie.overview}
              </p>
              {movie.overview?.length > 200 && (
                <button
                  onClick={() => setShowFullOverview(!showFullOverview)}
                  className="text-red-500 mt-2"
                >
                  {showFullOverview ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              {movie.trailer_url && (
                <a href={movie.trailer_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  ▶ Watch Trailer
                </a>
              )}
              <button onClick={toggleWatchlist} className="btn-secondary">
                {inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
            </div>

            {/* Music Platforms */}
            {movie.external_links && movie.external_links.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3">Listen on</h3>
                <div className="flex flex-wrap gap-3">
                  {movie.external_links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}

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
                  onClick={() => setActiveTab('crew')}
                  className={`pb-2 ${activeTab === 'crew' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-400'}`}
                >
                  Crew
                </button>
                <button
                  onClick={() => setActiveTab('links')}
                  className={`pb-2 ${activeTab === 'links' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-400'}`}
                >
                  Links
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'cast' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {activeTab === 'crew' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {activeTab === 'links' && (
              <div className="space-y-3">
                {movie.external_links?.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 glass-dark rounded-lg hover:bg-white/20 transition"
                  >
                    {link.platform} →
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
