import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

const WatchMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    const { data } = await supabase
      .from('movies')
      .select('id, title, embed_link')
      .eq('id', id)
      .single();
    setMovie(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!movie?.embed_link) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Streaming not available</p>
          <button
            onClick={() => navigate(`/movie/${id}`)}
            className="text-yellow-400 hover:underline"
          >
            ← Back to Movie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-black">
        <button
          onClick={() => navigate(`/movie/${id}`)}
          className="text-zinc-300 hover:text-white text-sm font-medium flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-sm font-medium text-zinc-100 truncate max-w-md">
          {movie.title}
        </h1>
        <div className="w-16" />
      </div>

      {/* Player */}
      <div className="flex-1 bg-black">
        <iframe
          src={movie.embed_link}
          className="w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
};

export default WatchMovie;
