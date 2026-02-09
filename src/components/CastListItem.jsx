import { useNavigate } from 'react-router-dom';

const CastListItem = ({ person, role, personId }) => {
  const navigate = useNavigate();

  return (
    <li
      onClick={() => personId && navigate(`/person/${personId}`)}
      className="flex items-center gap-3 py-3 px-2 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {person.profile_url ? (
          <img
            src={person.profile_url}
            alt={`${person.name} profile`}
            className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border border-white/10"
            loading="lazy"
          />
        ) : (
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <svg className="w-5 h-5 md:w-7 md:h-7 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-red-500 hover:underline truncate">
          {person.name}
        </p>
        <p className="text-sm text-gray-400 truncate md:hidden">
          {role}
        </p>
      </div>

      {/* Role (Desktop) */}
      <div className="hidden md:block text-sm text-gray-400 text-right">
        {role}
      </div>
    </li>
  );
};

export default CastListItem;
