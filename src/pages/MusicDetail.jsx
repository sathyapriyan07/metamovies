import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMusicById } from '../services/supabase';
import { useWatchlist } from '../hooks/useWatchlist';
import MusicHero from '../components/MusicHero';
import MusicPlatforms from '../components/MusicPlatforms';

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}min ${secs.toString().padStart(2, '0')}sec`;
};

const MusicDetail = () => {
  const { id } = useParams();
  const { addItem, removeItem, checkInWatchlist } = useWatchlist();
  const navigate = useNavigate();
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);

  useEffect(() => {
    loadTrack();
  }, [id]);

  const loadTrack = async () => {
    setLoading(true);
    const { data } = await getMusicById(id);
    setTrack(data);
    if (data) {
      const isIn = await checkInWatchlist(data.id, 'music');
      setInWatchlist(isIn);
    }
    setLoading(false);
  };

  const toggleWatchlist = async () => {
    if (!track) return;
    if (inWatchlist) {
      await removeItem(track.id, 'music');
      setInWatchlist(false);
    } else {
      await addItem(track.id, 'music');
      setInWatchlist(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!track) return <div className="min-h-screen flex items-center justify-center">Music not found</div>;

  const artistName = track.album?.artist?.name || track.artist;
  const albumTitle = track.album?.title || track.album;
  const cover = track.artwork_url || track.album?.cover_image_url || null;

  return (
    <div className="min-h-screen pb-24 md:pb-12">
      <MusicHero poster={cover} title={track.title} />

      <div className="mt-16 md:mt-24 text-center px-4">
        <p className="text-emerald-300 text-xs uppercase tracking-[0.3em]">Music</p>
        <h1 className="text-3xl md:text-5xl font-semibold text-white mt-3">{track.title}</h1>
        {artistName && (
          <button
            onClick={() => track.album?.artist?.id && navigate(`/artist/${track.album.artist.id}`)}
            className="text-gray-300 mt-2 text-sm md:text-base hover:text-white transition"
          >
            {artistName}
          </button>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 text-sm md:text-base text-gray-300 mt-4">
          {track.album?.release_year && <span>{track.album.release_year}</span>}
          {track.album?.release_year && track.duration_seconds ? <span className="meta-separator">•</span> : null}
          {track.duration_seconds ? <span>{formatDuration(track.duration_seconds)}</span> : null}
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-6 mb-8">
          <button onClick={toggleWatchlist} className="btn-ghost">
            {inWatchlist ? 'In Watchlist' : '+ Add to Watchlist'}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-xl font-semibold mb-4">Listen On</h3>
          <MusicPlatforms
            spotifyUrl={track.spotify_url}
            appleMusicUrl={track.apple_music_url}
            youtubeMusicUrl={track.youtube_music_url}
            amazonMusicUrl={track.amazon_music_url}
          />
        </div>

        {albumTitle && (
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-xl font-semibold mb-3">Album</h3>
            <button
              onClick={() => track.album?.id && navigate(`/album/${track.album.id}`)}
              className="text-gray-300 hover:text-white transition"
            >
              {albumTitle}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicDetail;
