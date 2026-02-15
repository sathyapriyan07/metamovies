const PlatformButton = ({ platform, active = false, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={platform.name}
      className={`snap-start flex-shrink-0 px-4 rounded-full border backdrop-blur-sm transition-all duration-250 flex items-center justify-center min-w-[78px] h-[48px] md:h-[50px] lg:h-[52px] ${
        active
          ? 'bg-white/14 border-white/35 scale-[1.03] shadow-[0_2px_10px_rgba(180,210,255,0.18)]'
          : 'bg-white/6 border-white/22 hover:bg-white/10 hover:border-white/28 hover:brightness-110'
      }`}
    >
      {platform.logo_url && (
        <img
          src={platform.logo_url}
          alt={platform.name}
          loading="lazy"
          className={`h-[22px] md:h-[24px] lg:h-[26px] w-auto max-w-[100px] object-contain transition-all duration-250 ${
            active ? 'grayscale-0 brightness-110 opacity-100' : 'grayscale opacity-85'
          }`}
        />
      )}
    </button>
  );
};

export default PlatformButton;
