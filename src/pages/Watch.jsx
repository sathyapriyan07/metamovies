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
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!movie) {
    return (
      <div style={{ padding: 20 }}>
        <p>Movie not found</p>
        <button type="button" onClick={() => navigate('/movies')}>
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <button type="button" onClick={() => navigate(`/movie/${movie.id}`)}>
        Back
      </button>
      <h1>Watch: {movie.title}</h1>
      <p>Player Enabled: {movie.player_enabled ? 'Yes' : 'No'}</p>
      {movie.player_url_override && (
        <p>
          Source: <a href={movie.player_url_override} target="_blank" rel="noopener noreferrer">Open Player</a>
        </p>
      )}
      {!movie.player_url_override && !movie.tmdb_id && movie.player_enabled && (
        <p>No valid source available.</p>
      )}
    </div>
  );
};

export default Watch;
