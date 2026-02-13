import { useNavigate } from 'react-router-dom';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  const openVideo = () => {
    window.open(video.youtube_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group">
      <div 
        onClick={openVideo}
        className="relative aspect-video overflow-hidden rounded-2xl mb-3 cursor-pointer"
      >
        <img
          src={video.thumbnail_url || `https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
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
