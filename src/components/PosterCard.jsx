import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { addToWatchlist } from '../services/supabase';

const PosterCard = ({ item, type = 'movie', showQuickActions = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  const handleAdd = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (adding) return;
    setAdding(true);
    await addToWatchlist(user.id, item.id, type);
    setAdded(true);
    setAdding(false);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleTrailer = (e) => {
    e.stopPropagation();
    if (item.trailer_url) {
      window.open(item.trailer_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="poster-card relative group" onClick={handleClick}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl">
        <img
          src={item.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={item.title || item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {item.rating && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold bg-black/60 border border-white/10 text-sky-200">
            {item.rating.toFixed(1)}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white font-semibold text-sm line-clamp-2 mb-2">{item.title || item.name}</p>
          {showQuickActions && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleTrailer}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${item.trailer_url ? 'bg-white/90 text-black hover:bg-white' : 'bg-white/10 text-gray-400 cursor-not-allowed'}`}
                disabled={!item.trailer_url}
              >
                Play Trailer
              </button>
              <button
                onClick={handleAdd}
                className="px-3 py-1 rounded-full text-xs font-semibold border border-sky-300/40 text-sky-200 hover:bg-sky-400/20"
              >
                {added ? 'Added' : adding ? 'Adding...' : 'Watchlist'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PosterCard;
