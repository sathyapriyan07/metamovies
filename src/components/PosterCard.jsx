import { useNavigate } from 'react-router-dom';

const PosterCard = ({ item, type = 'movie' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  return (
    <div className="poster-card min-w-[120px] md:min-w-[160px] relative" onClick={handleClick}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
        <img
          src={item.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={item.title || item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating badge */}
        {item.rating && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-md">
            <span className="text-xs font-semibold text-yellow-400">⭐ {item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3">
        <h3 className="text-sm md:text-base font-semibold line-clamp-2 leading-tight">{item.title || item.name}</h3>
        <p className="text-xs text-gray-400 mt-1">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</p>
      </div>
    </div>
  );
};

export default PosterCard;
