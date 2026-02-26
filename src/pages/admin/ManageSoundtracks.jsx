import { useEffect, useState } from 'react';
import {
  getAlbums,
  getTracks,
  getMovies,
  getPersons,
  getArtists,
  upsertArtist,
  upsertAlbum,
  upsertTrack,
  setSongArtists
} from '../../services/supabase';

const ManageSoundtracks = () => {
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [movies, setMovies] = useState([]);
  const [persons, setPersons] = useState([]);
  const [artists, setArtists] = useState([]);
  const [artistForm, setArtistForm] = useState({ id: '', name: '' });
  const [albumForm, setAlbumForm] = useState({
    id: '',
    title: '',
    movie_id: '',
    artist_id: '',
    release_date: '',
    language: '',
    label: '',
    cover_image_url: ''
  });
  const [songForm, setSongForm] = useState({
    id: '',
    album_id: '',
    title: '',
    track_no: '',
    youtube_official_url: '',
    spotify_url: '',
    apple_music_url: '',
    jiosaavn_url: '',
    amazon_music_url: '',
    youtube_music_url: '',
    composers: [],
    singers: [],
    lyricists: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [albumResp, trackResp, movieResp, personResp, artistResp] = await Promise.all([
      getAlbums(),
      getTracks(),
      getMovies(100, 0),
      getPersons(200),
      getArtists()
    ]);
    setAlbums(albumResp.data || []);
    setTracks(trackResp.data || []);
    setMovies(movieResp.data || []);
    setPersons(personResp.data || []);
    setArtists(artistResp.data || []);
  };

  const handleArtistSubmit = async (e) => {
    e.preventDefault();
    await upsertArtist({
      id: artistForm.id || undefined,
      name: artistForm.name
    });
    setArtistForm({ id: '', name: '' });
    await loadData();
  };

  const handleAlbumSubmit = async (e) => {
    e.preventDefault();
    await upsertAlbum({
      id: albumForm.id || undefined,
      title: albumForm.title,
      movie_id: albumForm.movie_id || null,
      artist_id: albumForm.artist_id || null,
      release_date: albumForm.release_date || null,
      language: albumForm.language || null,
      label: albumForm.label || null,
      cover_image_url: albumForm.cover_image_url || null
    });
    setAlbumForm({ id: '', title: '', movie_id: '', artist_id: '', release_date: '', language: '', label: '', cover_image_url: '' });
    await loadData();
  };

  const handleSongSubmit = async (e) => {
    e.preventDefault();
    const { data } = await upsertTrack({
      id: songForm.id || undefined,
      album_id: songForm.album_id || null,
      title: songForm.title,
      track_no: songForm.track_no ? Number(songForm.track_no) : null,
      youtube_official_url: songForm.youtube_official_url || null,
      spotify_url: songForm.spotify_url || null,
      apple_music_url: songForm.apple_music_url || null,
      jiosaavn_url: songForm.jiosaavn_url || null,
      amazon_music_url: songForm.amazon_music_url || null,
      youtube_music_url: songForm.youtube_music_url || null
    });

    const composerIds = songForm.composers || [];
    const singerIds = songForm.singers || [];
    const lyricistIds = songForm.lyricists || [];
    const roles = [
      ...composerIds.map((personId) => ({ person_id: personId, role: 'composer' })),
      ...singerIds.map((personId) => ({ person_id: personId, role: 'singer' })),
      ...lyricistIds.map((personId) => ({ person_id: personId, role: 'lyricist' }))
    ];

    if (data?.id) {
      await setSongArtists(data.id, roles);
    }

    setSongForm({
      id: '',
      album_id: '',
      title: '',
      track_no: '',
      youtube_official_url: '',
      spotify_url: '',
      apple_music_url: '',
      jiosaavn_url: '',
      amazon_music_url: '',
      youtube_music_url: '',
      composers: [],
      singers: [],
      lyricists: []
    });
    await loadData();
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-10">
        <h1 className="text-2xl font-bold mb-6">Manage Soundtracks</h1>

        <section className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Add / Update Artist</h2>
          <form className="grid grid-cols-2 gap-3" onSubmit={handleArtistSubmit}>
            <input
              value={artistForm.name}
              onChange={(e) => setArtistForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Artist name"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm col-span-2"
              required
            />
            <button className="btn-primary h-10 col-span-2">Save Artist</button>
          </form>
        </section>

        <section className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Add / Update Album</h2>
          <form className="grid grid-cols-2 gap-3" onSubmit={handleAlbumSubmit}>
            <input
              value={albumForm.title}
              onChange={(e) => setAlbumForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Album title"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
              required
            />
            <select
              value={albumForm.artist_id}
              onChange={(e) => setAlbumForm((prev) => ({ ...prev, artist_id: e.target.value }))}
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            >
              <option value="">Artist</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>{artist.name}</option>
              ))}
            </select>
            <select
              value={albumForm.movie_id}
              onChange={(e) => setAlbumForm((prev) => ({ ...prev, movie_id: e.target.value }))}
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            >
              <option value="">Link to Movie</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>{movie.title}</option>
              ))}
            </select>
            <input
              value={albumForm.release_date}
              onChange={(e) => setAlbumForm((prev) => ({ ...prev, release_date: e.target.value }))}
              type="date"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <input
              value={albumForm.language}
              onChange={(e) => setAlbumForm((prev) => ({ ...prev, language: e.target.value }))}
              placeholder="Language"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <input
              value={albumForm.label}
              onChange={(e) => setAlbumForm((prev) => ({ ...prev, label: e.target.value }))}
              placeholder="Label"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <input
              value={albumForm.cover_image_url}
              onChange={(e) => setAlbumForm((prev) => ({ ...prev, cover_image_url: e.target.value }))}
              placeholder="Cover image URL"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm col-span-2"
            />
            <button className="btn-primary h-10 col-span-2">Save Album</button>
          </form>
        </section>

        <section className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Add / Update Song</h2>
          <form className="grid grid-cols-2 gap-3" onSubmit={handleSongSubmit}>
            <input
              value={songForm.title}
              onChange={(e) => setSongForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Song title"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
              required
            />
            <select
              value={songForm.album_id}
              onChange={(e) => setSongForm((prev) => ({ ...prev, album_id: e.target.value }))}
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
              required
            >
              <option value="">Album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>{album.title}</option>
              ))}
            </select>
            <input
              value={songForm.track_no}
              onChange={(e) => setSongForm((prev) => ({ ...prev, track_no: e.target.value }))}
              placeholder="Track #"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <input
              value={songForm.youtube_official_url}
              onChange={(e) => setSongForm((prev) => ({ ...prev, youtube_official_url: e.target.value }))}
              placeholder="YouTube official URL"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <input
              value={songForm.spotify_url}
              onChange={(e) => setSongForm((prev) => ({ ...prev, spotify_url: e.target.value }))}
              placeholder="Spotify URL"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <input
              value={songForm.apple_music_url}
              onChange={(e) => setSongForm((prev) => ({ ...prev, apple_music_url: e.target.value }))}
              placeholder="Apple Music URL"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <input
              value={songForm.jiosaavn_url}
              onChange={(e) => setSongForm((prev) => ({ ...prev, jiosaavn_url: e.target.value }))}
              placeholder="JioSaavn URL"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <input
              value={songForm.amazon_music_url}
              onChange={(e) => setSongForm((prev) => ({ ...prev, amazon_music_url: e.target.value }))}
              placeholder="Amazon Music URL"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <input
              value={songForm.youtube_music_url}
              onChange={(e) => setSongForm((prev) => ({ ...prev, youtube_music_url: e.target.value }))}
              placeholder="YouTube Music URL"
              className="h-10 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
            />
            <div className="col-span-2">
              <label className="text-xs text-gray-400">Composers</label>
              <select
                multiple
                value={songForm.composers.map(String)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                  setSongForm((prev) => ({ ...prev, composers: values }));
                }}
                className="w-full min-h-[120px] bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
              >
                {persons.map((person) => (
                  <option key={`composer-${person.id}`} value={person.id}>{person.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400">Singers</label>
              <select
                multiple
                value={songForm.singers.map(String)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                  setSongForm((prev) => ({ ...prev, singers: values }));
                }}
                className="w-full min-h-[120px] bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
              >
                {persons.map((person) => (
                  <option key={`singer-${person.id}`} value={person.id}>{person.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400">Lyricists</label>
              <select
                multiple
                value={songForm.lyricists.map(String)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                  setSongForm((prev) => ({ ...prev, lyricists: values }));
                }}
                className="w-full min-h-[120px] bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
              >
                {persons.map((person) => (
                  <option key={`lyricist-${person.id}`} value={person.id}>{person.name}</option>
                ))}
              </select>
            </div>
            <button className="btn-primary h-10 col-span-2">Save Song</button>
          </form>
          {persons.length > 0 && (
            <div className="text-xs text-gray-400 mt-3">
              Tip: Use person IDs from People directory. Total persons loaded: {persons.length}
            </div>
          )}
        </section>

        <section className="py-4">
          <h2 className="text-lg font-semibold mb-3">Artists</h2>
          <div className="space-y-2">
            {artists.map((artist) => (
              <div key={artist.id} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3">
                <div className="text-sm font-medium">{artist.name}</div>
              </div>
            ))}
            {artists.length === 0 && <div className="text-sm text-gray-400">No artists yet.</div>}
          </div>
        </section>

        <section className="py-4">
          <h2 className="text-lg font-semibold mb-3">Albums</h2>
          <div className="space-y-2">
            {albums.map((album) => (
              <div key={album.id} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3">
                <div className="text-sm font-medium">{album.title}</div>
                <div className="text-xs text-gray-400">Artist: {album.artist?.name || '—'}</div>
                <div className="text-xs text-gray-400">Movie ID: {album.movie_id || '—'}</div>
              </div>
            ))}
            {albums.length === 0 && <div className="text-sm text-gray-400">No albums yet.</div>}
          </div>
        </section>

        <section className="py-4">
          <h2 className="text-lg font-semibold mb-3">Songs</h2>
          <div className="space-y-2">
            {tracks.map((track) => (
              <div key={track.id} className="bg-[#1a1a1a] border border-gray-800 rounded-md p-3">
                <div className="text-sm font-medium">{track.title}</div>
                <div className="text-xs text-gray-400">Album: {track.album?.title || '—'}</div>
              </div>
            ))}
            {tracks.length === 0 && <div className="text-sm text-gray-400">No songs yet.</div>}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ManageSoundtracks;
