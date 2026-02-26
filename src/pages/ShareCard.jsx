import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import SeoHead from '../components/SeoHead';
import { getMovieById } from '../services/supabase';

const ShareCard = () => {
  const { movieId } = useParams();
  const cardRef = useRef(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadMovie();
  }, [movieId]);

  const loadMovie = async () => {
    setLoading(true);
    const { data } = await getMovieById(movieId);
    setMovie(data);
    setLoading(false);
  };

  const exportCard = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    const dataUrl = await toPng(cardRef.current, { cacheBust: true });
    const link = document.createElement('a');
    link.download = `${movie?.title || 'movie'}-share.png`;
    link.href = dataUrl;
    link.click();
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Movie not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <SeoHead title={`Share ${movie.title}`} description={`Share ${movie.title} with a cinematic card.`} />
      <div className="max-w-2xl mx-auto px-4 pb-10 pt-6">
        <h1 className="text-2xl font-bold">Share Card</h1>
        <p className="text-sm text-gray-400 mt-2">Export a cinematic card for social sharing.</p>

        <div className="mt-6 flex items-center justify-center">
          <div
            ref={cardRef}
            className="w-[360px] h-[520px] rounded-xl overflow-hidden shadow-2xl relative bg-[#111]"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.85)), url(${movie.backdrop_url || movie.poster_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <div className="text-xs uppercase text-white/70">MetaMovies+</div>
              <h2 className="text-2xl font-bold mt-2">{movie.title}</h2>
              <p className="text-xs text-white/70 mt-2 line-clamp-3">{movie.overview}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-white/80">
                <span>{movie.release_date?.split('-')[0]}</span>
                {movie.runtime && <span>{movie.runtime} min</span>}
              </div>
            </div>
          </div>
        </div>

        <button
          className="btn-primary h-11 w-full mt-6"
          onClick={exportCard}
          disabled={exporting}
        >
          {exporting ? 'Exporting...' : 'Download PNG'}
        </button>
      </div>
    </div>
  );
};

export default ShareCard;
