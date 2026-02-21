import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMovieById } from '../services/supabase';
import VideoPlayer from '../components/VideoPlayer';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovie = async () => {
      setLoading(true);
      const { data } = await getMovieById(id);
      setMovie(data || null);
      setLoading(false);
    };

    loadMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-white text-lg font-medium">Movie not found</p>
        <button
          type="button"
          onClick={() => navigate('/movies')}
          className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <main className="fixed inset-0 bg-black overflow-hidden">
      <button
        type="button"
        onClick={() => navigate(`/movie/${movie.id}`)}
        className="absolute left-4 top-4 z-30 rounded-xl border border-white/20 bg-black/50 px-3 py-2 text-sm text-white backdrop-blur-md hover:bg-black/70 transition"
      >
        Back
      </button>

      <div className="h-full w-full flex items-center justify-center px-3 md:px-8">
        <div className="w-full max-w-[1400px]">
          <VideoPlayer
            tmdbId={movie.tmdb_id}
            enabled={!!movie.player_enabled}
            overrideUrl={movie.player_url_override || ''}
            showFullscreenButton
          />
          {!movie.player_enabled && (
            <p className="mt-4 text-center text-sm text-gray-400">Player is disabled for this movie.</p>
          )}
          {!movie.tmdb_id && !movie.player_url_override && movie.player_enabled && (
            <p className="mt-4 text-center text-sm text-gray-400">No valid source available.</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default Watch;


