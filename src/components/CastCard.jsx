import { useNavigate } from 'react-router-dom';

const CastCard = ({ person, role, personId }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => personId && navigate(`/person/${personId}`)}
      className="flex-shrink-0 w-[130px] md:w-[170px] glass-card rounded-2xl cursor-pointer p-3 hover:scale-[1.02] transition"
    >
      {person.profile_url ? (
        <img
          src={person.profile_url}
          alt={`${person.name} profile photo`}
          className="w-full aspect-square object-cover rounded-xl mb-3"
          loading="lazy"
        />
      ) : (
        <div className="w-full aspect-square bg-white/10 rounded-xl mb-3 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      )}

      <div>
        <p className="font-semibold text-white text-sm line-clamp-1 mb-1">{person.name}</p>
        <p className="text-gray-400 text-xs line-clamp-2">{role}</p>
      </div>
    </div>
  );
};

export default CastCard;
