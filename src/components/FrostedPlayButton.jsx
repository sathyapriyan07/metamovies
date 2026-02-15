const FrostedPlayButton = ({ size = 'md', className = '' }) => {
  const sizeClass =
    size === 'lg'
      ? 'w-[4.5rem] h-[4.5rem] md:w-20 md:h-20'
      : 'w-16 h-16 md:w-[4.5rem] md:h-[4.5rem]';
  const iconClass = size === 'lg' ? 'w-6 h-6 md:w-7 md:h-7' : 'w-5 h-5 md:w-6 md:h-6';

  return (
    <div
      className={`inline-flex ${sizeClass} items-center justify-center rounded-full border border-white/35 bg-white/20 backdrop-blur-xl shadow-[0_8px_24px_rgba(125,211,252,0.28)] transition-all duration-300 group-hover:bg-white/28 group-hover:scale-[1.05] group-active:scale-[0.98] ${className}`}
    >
      <svg className={`${iconClass} text-white ml-0.5`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </div>
  );
};

export default FrostedPlayButton;
