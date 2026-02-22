import { useNavigate } from 'react-router-dom';

const PosterCard = ({ item, type = 'movie' }) => {
  const navigate = useNavigate();

  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/${type}/${item.id}`)} role="button" tabIndex={0}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5">
        <img
          src={item.poster_url || item.backdrop_url || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={item.title || item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="mt-2">
        <div className="text-sm font-semibold truncate">{item.title || item.name}</div>
        <div className="text-xs text-gray-400">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</div>
      </div>
    </div>
  );
};

export default PosterCard;
