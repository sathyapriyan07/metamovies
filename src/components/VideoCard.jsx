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
        className="glass-card relative aspect-video overflow-hidden rounded-[14px] mb-2 cursor-pointer card-hover"
      >
        {thumbnailSrc && !imageError ? (
          <img
            src={thumbnailSrc}
            alt={video.title}
            className="relative z-[1] w-full h-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
            Thumbnail unavailable
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90 group-hover:opacity-75 transition-opacity duration-250" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FrostedPlayButton />
        </div>
      </div>
      <h3 className="font-semibold text-sm line-clamp-2 text-white/95 transition-colors group-hover:text-white">
        {video.title}
      </h3>
      {video.description && (
        <button
          onClick={() => navigate(`/videos/${video.id}`)}
          className="text-xs text-white/70 hover:text-white mt-2 transition"
        >
          View Description
        </button>
      )}
    </div>
  );
};

export default VideoCard;


