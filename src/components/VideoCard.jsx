import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import FrostedPlayButton from './FrostedPlayButton';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const thumbnailSrc = useMemo(() => {
    if (video?.thumbnail_url) return video.thumbnail_url;
    if (video?.youtube_id) return `https://img.youtube.com/vi/${video.youtube_id}/maxresdefault.jpg`;
    return null;
  }, [video]);

  const openVideo = () => {
    window.open(video.youtube_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group">
      <div 
        onClick={openVideo}
        className="relative aspect-video overflow-hidden rounded-2xl mb-2 cursor-pointer bg-gradient-to-br from-slate-900 via-slate-800 to-black"
      >
        {thumbnailSrc && !imageError ? (
          <>
            <img
              src={thumbnailSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-35"
              loading="lazy"
              aria-hidden="true"
            />
            <img
              src={thumbnailSrc}
              alt={video.title}
              className="relative z-[1] w-full h-full object-contain"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
            Thumbnail unavailable
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FrostedPlayButton />
        </div>
      </div>
      <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-sky-300 transition-colors">
        {video.title}
      </h3>
      {video.description && (
        <button
          onClick={() => navigate(`/videos/${video.id}`)}
          className="text-xs text-sky-400 hover:text-sky-300 mt-2 transition"
        >
          View Description
        </button>
      )}
    </div>
  );
};

export default VideoCard;
