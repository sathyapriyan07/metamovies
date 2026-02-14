import { useNavigate } from 'react-router-dom';

const PosterCard = ({ item, type = 'movie' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-white/5 shadow-lg transition-all duration-300 group-hover:shadow-[0_8px_24px_rgba(59,167,255,0.35)] group-active:scale-[0.97]">
        <img
          src={item.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={item.title || item.name}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.03] group-hover:brightness-110"
          loading="lazy"
        />
      </div>
      <div className="mt-2.5 min-h-[48px]">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-white">{item.title || item.name}</h3>
        <p className="text-xs text-gray-400 mt-1">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</p>
      </div>
    </div>
  );
};

export default PosterCard;