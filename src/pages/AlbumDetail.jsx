import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { getAlbumById, getSongsByAlbum, resolveSlug, getPageMeta } from '../services/supabase';

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageMeta, setPageMeta] = useState(null);

  useEffect(() => {
    loadAlbum();
  }, [id]);

  const loadAlbum = async () => {
    setLoading(true);
    let resolvedId = id;
    if (!/^\d+$/.test(id)) {
      const { data: slugData } = await resolveSlug(id, 'album');
      resolvedId = slugData?.entity_id || id;
    }
    const [{ data: albumData }, { data: songsData }] = await Promise.all([
      getAlbumById(resolvedId),
      getSongsByAlbum(resolvedId)
    ]);
    setAlbum(albumData);
    setSongs(songsData || []);
    if (albumData?.id) {
      const { data: meta } = await getPageMeta('album', String(albumData.id));
      setPageMeta(meta || null);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }
  if (!album) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Album not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <SeoHead
        title={pageMeta?.title || `${album.title} - Album`}
        description={pageMeta?.description || `Soundtrack album for ${album.title}`}
        jsonLd={pageMeta?.jsonld || null}
      />
      <div className="max-w-2xl mx-auto px-4 pb-10 pt-6">
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-md overflow-hidden bg-[#1a1a1a] border border-gray-800">
            {album.cover_image_url && (
              <img loading="lazy" src={album.cover_image_url} alt={album.title} className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{album.title}</h1>
            {album.release_date && (
              <p className="text-sm text-gray-400 mt-1">Released {album.release_date}</p>
            )}
            {album.movie_id && (
              <button className="text-sm text-[#F5C518] mt-2" onClick={() => navigate(`/movie/${album.movie_id}`)}>
                View Movie
              </button>
            )}
          </div>
        </div>

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Songs</h2>
          <div className="space-y-2">
            {songs.map((song) => (
              <button
                key={song.id}
                className="w-full flex items-center justify-between text-left bg-[#1a1a1a] rounded-md p-3 border border-gray-800"
                onClick={() => navigate(`/songs/${song.id}`)}
              >
                <div>
                  <p className="text-sm font-medium">{song.title}</p>
                  {song.track_no && <p className="text-xs text-gray-400">Track {song.track_no}</p>}
                </div>
                <span className="text-xs text-gray-500">View</span>
              </button>
            ))}
            {songs.length === 0 && (
              <div className="text-sm text-gray-400">No songs listed yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AlbumDetail;
