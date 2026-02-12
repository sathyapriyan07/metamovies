import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const CastCard = ({ person, role, personId }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      onClick={() => personId && navigate(`/person/${personId}`)}
      className="flex-shrink-0 w-[130px] md:w-[170px] cursor-pointer hover:scale-[1.02] transition scroll-snap-align-start"
    >
      <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-white/10 mb-3">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
        {person.profile_url && (
          <img
            src={person.profile_url}
            alt={`${person.name} profile photo`}
            className="w-full h-full object-cover"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(false)}
          />
        )}
      </div>

      <div>
        <p className="font-semibold text-white text-sm line-clamp-1 mb-1">{person.name}</p>
        <p className="text-gray-400 text-xs line-clamp-1">{role}</p>
      </div>
    </div>
  );
};

export default CastCard;
