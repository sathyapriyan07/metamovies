import { useNavigate } from 'react-router-dom';

const PosterCard = ({ item, type = 'movie' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl md:rounded-2xl bg-black shadow-lg transition-all duration-300 active:scale-95 md:group-hover:scale-105 md:group-hover:shadow-[0_8px_24px_rgba(59,167,255,0.3)]">
        <img
          src={item.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={item.title || item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="mt-2 min-h-[48px] md:min-h-[56px] pb-2 md:pb-3">
        <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{item.title || item.name}</h3>
      </div>
    </div>
  );
};

export default PosterCard;