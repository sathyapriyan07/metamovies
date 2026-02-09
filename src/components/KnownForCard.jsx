import { useNavigate } from 'react-router-dom';

const KnownForCard = ({ work }) => {
  const navigate = useNavigate();

  return (
    <div className="glass glass-hover shadow-lg cursor-pointer p-3">
      <div className="flex gap-3">
        {/* Poster */}
        <img
          src={work.poster_url || 'https://via.placeholder.com/72x108'}
          alt={work.title}
          className="w-14 h-21 md:w-18 md:h-27 object-cover rounded-md flex-shrink-0"
          loading="lazy"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white line-clamp-1 mb-1">
            {work.title}
          </h3>
          
          {work.rating && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-yellow-400 text-sm">⭐</span>
              <span className="text-sm text-gray-300">{work.rating.toFixed(1)}</span>
            </div>
          )}
          
          <p className="text-sm text-gray-400 line-clamp-1 mb-1">
            {work.role}
          </p>
          
          {work.release_date && (
            <p className="text-sm text-gray-500">
              {work.release_date.split('-')[0]}
            </p>
          )}
        </div>

        {/* Info Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/${work.type}/${work.id}`);
          }}
          className="w-8 h-8 flex-shrink-0 rounded-full glass hover:bg-white/20 flex items-center justify-center transition-all duration-300"
          aria-label="View Details"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default KnownForCard;
