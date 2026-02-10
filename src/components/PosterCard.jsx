import { useNavigate } from 'react-router-dom';

const imdbIcon =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16"><rect width="24" height="16" rx="3" fill="%23f5c518"/><text x="12" y="11" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="9" font-weight="700" fill="%23000000">IMDb</text></svg>';
const rottenIcon =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="%23e50914" d="M12 2c3 2.5 6 5.5 6 9a6 6 0 1 1-12 0c0-3.5 3-6.5 6-9z"/><circle cx="9" cy="11" r="1.2" fill="%23ffffff"/><circle cx="15" cy="11" r="1.2" fill="%23ffffff"/></svg>';

const PosterCard = ({ item, type = 'movie' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  const imdbRating =
    typeof item.imdb_rating === 'number' ? item.imdb_rating.toFixed(1) : 'N/A';
  const rottenRating =
    typeof item.rotten_rating === 'number' ? `${Math.round(item.rotten_rating)}%` : 'N/A';

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

        <div className="absolute top-3 right-3 max-w-[90%] px-2 py-1 rounded-full text-[12px] font-medium bg-black/60 backdrop-blur border border-white/10 flex flex-wrap items-center gap-2 shadow-sm group-hover:shadow-sky-400/20 transition-shadow">
          <span className="flex items-center gap-1 text-gray-200">
            <img src={imdbIcon} alt="IMDb" className="w-6 h-4" loading="lazy" decoding="async" />
            {imdbRating}
          </span>
          <span className="flex items-center gap-1 text-gray-200">
            <img src={rottenIcon} alt="Rotten Tomatoes" className="w-4 h-4" loading="lazy" decoding="async" />
            {rottenRating}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white font-semibold text-sm line-clamp-2">{item.title || item.name}</p>
        </div>
      </div>
    </div>
  );
};

export default PosterCard;
