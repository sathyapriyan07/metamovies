import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAlbumById, getTracksByAlbum } from '../services/supabase';
import MusicCard from '../components/MusicCard';
import MusicPlatforms from '../components/MusicPlatforms';

const AlbumDetail = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlbum();
  }, [id]);

  const loadAlbum = async () => {
    setLoading(true);
    const [{ data: albumData }, { data: tracksData }] = await Promise.all([
      getAlbumById(id),
      getTracksByAlbum(id)
    ]);
    setAlbum(albumData);
    setTracks(tracksData || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-400"></div>
      </div>
    );
  }

  if (!album) return <div className="min-h-screen flex items-center justify-center">Album not found</div>;

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
        <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
          {album.cover_image_url ? (
            <img
              src={album.cover_image_url}
              alt={album.title}
              className="w-40 h-40 rounded-2xl object-cover border border-white/10"
              loading="lazy"
            />
          ) : null}
          <div>
            <p className="text-emerald-300 text-xs uppercase tracking-[0.3em]">Album</p>
            <h1 className="text-3xl md:text-4xl font-semibold mt-2">{album.title}</h1>
            {album.artist?.name && <p className="text-gray-300 mt-2">{album.artist.name}</p>}
            {album.release_year && <p className="text-gray-400 text-sm mt-1">{album.release_year}</p>}
            <div className="mt-4">
              <MusicPlatforms
                spotifyUrl={album.spotify_url}
                appleMusicUrl={album.apple_music_url}
                youtubeMusicUrl={album.youtube_music_url}
                amazonMusicUrl={album.amazon_music_url}
              />
            </div>
          </div>
        </div>

        {tracks.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Tracks</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tracks.map((track) => (
                <MusicCard key={track.id} item={{ ...track, album }} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumDetail;
