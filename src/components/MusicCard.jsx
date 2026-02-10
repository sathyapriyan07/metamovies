import { useNavigate } from 'react-router-dom';

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}min ${secs.toString().padStart(2, '0')}sec`;
};

const MusicCard = ({ item }) => {
  const navigate = useNavigate();
  const duration = formatDuration(item.duration_seconds);
  const cover = item.artwork_url || item.album?.cover_image_url || null;
  const artist = item.album?.artist?.name || item.artist;

  return (
    <button
      onClick={() => navigate(`/music/${item.id}`)}
      className="group text-left w-full"
    >
      {cover ? (
        <div className="poster-card relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
          <img
            src={cover}
            alt={item.title}
            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
        </div>
      ) : null}
      <div className="mt-3 space-y-1">
        <p className="text-sm font-semibold text-white line-clamp-1">{item.title}</p>
        <p className="text-xs text-gray-400 line-clamp-1">{artist || 'Unknown Artist'}</p>
        {duration && <p className="text-xs text-emerald-300/80">{duration}</p>}
      </div>
    </button>
  );
};

export default MusicCard;
