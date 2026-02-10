import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getArtistById, getAlbumsByArtist, getTracksByArtist } from '../services/supabase';
import MusicCard from '../components/MusicCard';

const ArtistDetail = () => {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtist();
  }, [id]);

  const loadArtist = async () => {
    setLoading(true);
    const [{ data: artistData }, { data: albumsData }, { data: tracksData }] = await Promise.all([
      getArtistById(id),
      getAlbumsByArtist(id),
      getTracksByArtist(id)
    ]);
    setArtist(artistData);
    setAlbums(albumsData || []);
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

  if (!artist) return <div className="min-h-screen flex items-center justify-center">Artist not found</div>;

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
        <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
          {artist.profile_image_url ? (
            <img
              src={artist.profile_image_url}
              alt={artist.name}
              className="w-32 h-32 rounded-full object-cover border border-white/10"
              loading="lazy"
            />
          ) : null}
          <div className="flex-1">
            <p className="text-emerald-300 text-xs uppercase tracking-[0.3em]">Artist</p>
            <h1 className="text-3xl md:text-4xl font-semibold mt-2">{artist.name}</h1>
            {artist.bio && <p className="text-gray-300 mt-3 max-w-2xl">{artist.bio}</p>}
          </div>
        </div>

        {albums.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {albums.map((album) => (
                <div key={album.id} className="space-y-2">
                  {album.cover_image_url ? (
                    <img
                      src={album.cover_image_url}
                      alt={album.title}
                      className="w-full aspect-square object-cover rounded-2xl border border-white/10"
                      loading="lazy"
                    />
                  ) : null}
                  <p className="text-sm font-semibold">{album.title}</p>
                  {album.release_year && <p className="text-xs text-gray-400">{album.release_year}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {tracks.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Tracks</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tracks.map((track) => (
                <MusicCard key={track.id} item={track} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistDetail;
