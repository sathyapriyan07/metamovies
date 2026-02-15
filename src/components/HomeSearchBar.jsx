import { useNavigate } from 'react-router-dom';

const HomeSearchBar = () => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate('/search')}
      className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-all duration-200 focus-within:ring-1 focus-within:ring-white/25"
      role="button"
      tabIndex={0}
      aria-label="Search Movies and People"
      onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
    >
      <svg 
        className="w-5 h-5 text-gray-400 flex-shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span className="text-gray-400 text-sm md:text-base">Movies and more</span>
    </div>
  );
};

export default HomeSearchBar;
