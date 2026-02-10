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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white font-semibold text-sm line-clamp-2">{item.title || item.name}</p>
        </div>
      </div>
    </div>
  );
};

export default PosterCard;
