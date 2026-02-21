import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const PosterCard = ({ item, type = 'movie', compact = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/${type}/${item.id}`);
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div className="glass-card relative aspect-[2/3] overflow-hidden rounded-[14px] card-hover">
        <img
          src={item.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={item.title || item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className={`mt-2 ${compact ? 'min-h-[42px]' : 'min-h-[48px]'}`}>
        <h3 className={`font-semibold line-clamp-2 leading-tight text-white ${compact ? 'text-xs' : 'text-sm'}`}>
          {item.title || item.name}
        </h3>
        <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-[#9ba2b0] mt-1`}>
          {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}
        </p>
      </div>
    </div>
  );
};

export default memo(PosterCard);


