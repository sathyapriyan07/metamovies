import { useNavigate } from 'react-router-dom';

const PosterCard = ({ item, type = 'movie' }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="cursor-pointer group" 
      onClick={() => navigate(`/${type}/${item.id}`)} 
      role="button" 
      tabIndex={0}
    >
      <div className="space-y-2">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-900">
          {typeof item.rating === 'number' && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-md z-10">
              {item.rating.toFixed(1)}
            </div>
          )}
          <img
            src={item.poster_url || item.backdrop_url || 'https://via.placeholder.com/300x450?text=No+Image'}
            alt={item.title || item.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium truncate text-white">{item.title || item.name}</h3>
          <p className="text-xs text-zinc-500">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</p>
        </div>
      </div>
    </div>
  );
};

export default PosterCard;
