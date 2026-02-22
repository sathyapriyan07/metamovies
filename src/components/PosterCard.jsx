import { useNavigate } from 'react-router-dom';

const PosterCard = ({ item, type = 'movie' }) => {
  const navigate = useNavigate();

  return (
    <div className="cursor-pointer" onClick={() => navigate(`/${type}/${item.id}`)} role="button" tabIndex={0}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-[#1a1a1a]">
        {typeof item.rating === 'number' && (
          <div className="absolute top-2 left-2 bg-[#F5C518] text-black text-xs font-semibold px-2 py-0.5 rounded">
            {item.rating.toFixed(1)}
          </div>
        )}
        <img
          src={item.poster_url || item.backdrop_url || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={item.title || item.name}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="mt-2">
        <div className="text-sm font-medium truncate">{item.title || item.name}</div>
        <div className="text-xs text-gray-400">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</div>
      </div>
    </div>
  );
};

export default PosterCard;
