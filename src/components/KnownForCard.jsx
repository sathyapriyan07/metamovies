import { useNavigate } from 'react-router-dom';

const KnownForCard = ({ work }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/${work.type}/${work.id}`)}
      className="cursor-pointer group"
    >
      <div className="glass rounded-lg overflow-hidden hover:scale-[1.02] will-change-transform transition-transform duration-300">
        <img
          src={work.poster_url || 'https://via.placeholder.com/150x225'}
          alt={work.title}
          className="w-full aspect-[2/3] object-cover"
          loading="lazy"
        />
      </div>
      <p className="font-semibold text-xs md:text-sm mt-2 line-clamp-2">{work.title}</p>
    </div>
  );
};

export default KnownForCard;


