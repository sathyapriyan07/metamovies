import { useState } from 'react';

const Avatar = ({ src, name, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-10 h-10 text-lg'
  };

  const fallbackLetter = name?.[0]?.toUpperCase() || 'U';

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full overflow-hidden border border-white/10 bg-red-600 flex items-center justify-center transition-transform duration-200 hover:scale-[1.02] will-change-transform ${className}`}
      aria-label="Profile"
    >
      {src && !imageError ? (
        <img
          src={src}
          alt="User Avatar"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-white font-bold">{fallbackLetter}</span>
      )}
    </div>
  );
};

export default Avatar;


