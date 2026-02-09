import { useNavigate } from 'react-router-dom';

const PosterCard = ({ item, type = 'movie' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
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
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Title on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white font-semibold text-sm line-clamp-2">{item.title || item.name}</p>
        </div>
        
        {/* Rating badge */}
        {item.rating && (
          <div className="absolute top-2 right-2 glass px-2 py-1 rounded-md shadow-lg">
            <span className="text-xs font-semibold text-yellow-400">⭐ {item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PosterCard;
