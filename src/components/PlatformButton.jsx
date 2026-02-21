import { memo } from 'react';

const PlatformButton = ({ platform, active = false, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={platform.name}
      className={`snap-start flex-shrink-0 px-4 rounded-full border transition-all duration-250 flex items-center justify-center min-w-[78px] h-[48px] md:h-[50px] lg:h-[52px] relative overflow-hidden ${
        active
          ? 'glass-pill glass-pill-active scale-[1.02]'
          : 'glass-pill'
      }`}
    >
      <span
        className={`absolute left-3 right-3 bottom-[6px] h-[2px] rounded-full transition-all duration-250 ${
          active ? 'bg-white/85 opacity-100' : 'bg-white/40 opacity-0'
        }`}
      />
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

export default memo(PlatformButton);


