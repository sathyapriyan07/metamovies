import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { getSongById, recordViewEvent, resolveSlug, getPageMeta } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const extractYouTubeId = (url) => {
  const regExp =
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?/]+)/;
  const match = url?.match(regExp);
  return match ? match[1] : null;
};

const SongDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageMeta, setPageMeta] = useState(null);

  useEffect(() => {
    loadSong();
  }, [id]);

  const loadSong = async () => {
    setLoading(true);
    let resolvedId = id;
    if (!/^\d+$/.test(id)) {
      const { data: slugData } = await resolveSlug(id, 'song');
      resolvedId = slugData?.entity_id || id;
    }
    const { data } = await getSongById(resolvedId);
    setSong(data);
    if (data?.id) {
      const { data: meta } = await getPageMeta('song', String(data.id));
      setPageMeta(meta || null);
      await recordViewEvent('song', data.id, user?.id || null);
    }
    setLoading(false);
  };

  const youtubeId = useMemo(() => extractYouTubeId(song?.youtube_official_url), [song?.youtube_official_url]);

  const roles = (song?.song_artists || []).reduce((acc, item) => {
    const key = item.role || 'composer';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item.person);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Loading...</div>
      </div>
    );
  }
  if (!song) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">Song not found</div>
      </div>
    );
  }

  const platformLinks = [
    { label: 'Spotify', url: song.spotify_url },
    { label: 'Apple Music', url: song.apple_music_url },
    { label: 'JioSaavn', url: song.jiosaavn_url },
    { label: 'Amazon Music', url: song.amazon_music_url },
    { label: 'YouTube Music', url: song.youtube_music_url }
  ].filter((item) => item.url);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <SeoHead
        title={pageMeta?.title || `${song.title} - Song`}
        description={pageMeta?.description || `Listen to ${song.title}`}
        jsonLd={pageMeta?.jsonld || null}
      />
      <div className="max-w-2xl mx-auto px-4 pb-10 pt-6">
        <h1 className="text-2xl font-bold">{song.title}</h1>
        {song.album?.title && (
          <button className="text-sm text-[#F5C518] mt-2" onClick={() => navigate(`/albums/${song.album.id}`)}>
            View Album: {song.album.title}
          </button>
        )}

        {youtubeId && (
          <div className="mt-6 w-full aspect-video rounded-md overflow-hidden border border-gray-800 bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title="Official Song Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        )}

        {platformLinks.length > 0 && (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Listen On</h2>
            <div className="grid grid-cols-2 gap-3">
              {platformLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3 text-sm"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Credits</h2>
          <div className="space-y-3">
            {['composer', 'singer', 'lyricist'].map((role) => (
              <div key={role} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3">
                <p className="text-xs text-gray-400 uppercase">{role}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(roles[role] || []).map((person) => (
                    <button
                      key={`${role}-${person.id}`}
                      className="text-sm text-[#F5C518]"
                      onClick={() => navigate(`/person/${person.id}`)}
                    >
                      {person.name}
                    </button>
                  ))}
                  {(roles[role] || []).length === 0 && (
                    <span className="text-sm text-gray-500">Not listed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SongDetail;
