import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMovieById } from '../services/supabase';

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
    return <div className="min-h-screen bg-[#0f0f0f] text-white px-4 pt-12">Loading...</div>;
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white px-4 pt-12">
        <p>Movie not found</p>
        <button type="button" className="mt-3 text-sm text-[#F5C518]" onClick={() => navigate('/movies')}>
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <button type="button" className="text-sm text-gray-400 hover:text-white" onClick={() => navigate(`/movie/${movie.id}`)}>
          Back
        </button>
        <h1 className="text-lg font-semibold mt-2">Watch: {movie.title}</h1>
        <p className="text-sm text-gray-400 mt-2">Player Enabled: {movie.player_enabled ? 'Yes' : 'No'}</p>
        {movie.player_url_override && (
          <div className="mt-3">
            <a className="text-sm text-[#F5C518]" href={movie.player_url_override} target="_blank" rel="noopener noreferrer">Open Player</a>
          </div>
        )}
        {!movie.player_url_override && !movie.tmdb_id && movie.player_enabled && (
          <p className="mt-3 text-sm text-gray-400">No valid source available.</p>
        )}
      </div>
    </div>
  );
};

export default Watch;
