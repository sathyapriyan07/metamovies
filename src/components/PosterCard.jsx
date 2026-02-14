import { useNavigate } from 'react-router-dom';

const PosterCard = ({ item, type = 'movie' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-white/5 shadow-lg group-hover:shadow-[0_8px_24px_rgba(59,167,255,0.25)] transition-shadow duration-250">
        <img
          src={item.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={item.title || item.name}
          className="w-full h-full object-cover transition-all duration-250 group-hover:scale-[1.05] group-hover:brightness-105"
          loading="lazy"
        />
      </div>
      <div className="mt-2 min-h-[56px] pb-3">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{item.title || item.name}</h3>
        <p className="text-xs text-gray-400 mt-1">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</p>
      </div>
    </div>
  );
};

export default PosterCard;