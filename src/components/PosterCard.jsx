import { useNavigate } from 'react-router-dom';

const PosterCard = ({ item, type = 'movie' }) => {
  const navigate = useNavigate();

  return (
    <div className="poster-card" onClick={() => navigate(`/${type}/${item.id}`)} role="button" tabIndex={0}>
      <img
        src={item.poster_url || item.backdrop_url || 'https://via.placeholder.com/300x450?text=No+Image'}
        alt={item.title || item.name}
        loading="lazy"
      />
      <div className="poster-overlay" />
      <div className="poster-info">
        <div className="poster-title">{item.title || item.name}</div>
        <div className="poster-year">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0]}</div>
      </div>
    </div>
  );
};

export default PosterCard;
