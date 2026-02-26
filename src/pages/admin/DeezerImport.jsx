import { useEffect, useMemo, useRef, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { searchDeezer, getDeezerAlbum, getDeezerTrack, getDeezerArtist } from '../../services/deezer';
import { supabase } from '../../services/supabase';

const TYPES = ['album', 'track', 'artist'];

const DeezerImport = () => {
  const [type, setType] = useState('album');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [existingIds, setExistingIds] = useState(new Set());
  const debounceRef = useRef(null);

  const search = async (q) => {
    if (!q.trim()) {
      setResults([]);
      setExistingIds(new Set());
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await searchDeezer(type, q);
      const list = data?.data || [];
      setResults(list);
      await loadExisting(list);
    } catch (err) {
      setError(err.message || 'Failed to load Deezer results.');
    } finally {
      setLoading(false);
    }
  };

  const loadExisting = async (list) => {
    if (!list.length) {
      setExistingIds(new Set());
      return;
    }
    const ids = list.map((item) => item.id);
    let table = 'albums';
    let column = 'deezer_album_id';
    if (type === 'track') {
      table = 'tracks';
      column = 'deezer_track_id';
    }
    if (type === 'artist') {
      table = 'artists';
      column = 'deezer_artist_id';
    }
    const { data } = await supabase
      .from(table)
      .select(column)
      .in(column, ids);
    const set = new Set((data || []).map((row) => row[column]));
    setExistingIds(set);
  };

  const handleSearch = (value) => {
    setQuery(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => search(value), 400);
  };

  const handleSelect = async (item) => {
    setError('');
    setSelected(null);
    try {
      if (type === 'album') {
        const data = await getDeezerAlbum(item.id);
        setSelected({ type, data, edit: mapAlbum(data) });
      } else if (type === 'track') {
        const data = await getDeezerTrack(item.id);
        setSelected({ type, data, edit: mapTrack(data) });
      } else {
        const data = await getDeezerArtist(item.id);
        setSelected({ type, data, edit: mapArtist(data) });
      }
    } catch (err) {
      setError(err.message || 'Failed to load details.');
    }
  };

  const mapArtist = (artist) => ({
    deezer_artist_id: artist.id,
    name: artist.name || '',
    image_url: artist.picture_xl || artist.picture_big || artist.picture_medium || '',
    profile_image_url: artist.picture_big || artist.picture || '',
    banner_image_url: artist.picture_xl || ''
  });

  const mapAlbum = (album) => ({
    deezer_album_id: album.id,
    title: album.title || '',
    cover_url: album.cover_xl || album.cover_big || album.cover_medium || '',
    cover_image_url: album.cover_big || album.cover || '',
    release_date: album.release_date || null,
    artist: album.artist ? mapArtist(album.artist) : null,
    tracks: (album.tracks?.data || []).map(mapTrack)
  });

  const mapTrack = (track) => ({
    deezer_track_id: track.id,
    title: track.title || '',
    duration_seconds: track.duration || null,
    preview_url: track.preview || null,
    artist: track.artist ? mapArtist(track.artist) : null,
    album_id: track.album?.id || null,
    album: track.album
  });

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setToast(null);
    try {
      if (selected.type === 'artist') {
        await upsertArtist(selected.edit);
      } else if (selected.type === 'album') {
        await importAlbum(selected.edit);
      } else {
        await importTrack(selected.edit);
      }
      setToast({ type: 'success', message: 'Imported successfully.' });
      await search(query);
      setSelected(null);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Import failed.' });
    } finally {
      setSaving(false);
    }
  };

  const upsertArtist = async (artist) => {
    const { data: existingById } = await supabase
      .from('artists')
      .select('*')
      .eq('deezer_artist_id', artist.deezer_artist_id)
      .single();
    if (existingById?.id) return existingById;

    const { data: existingByName } = await supabase
      .from('artists')
      .select('*')
      .eq('name', artist.name)
      .single();
    if (existingByName?.id) return existingByName;

    const { data, error } = await supabase
      .from('artists')
      .insert({
        name: artist.name,
        deezer_artist_id: artist.deezer_artist_id,
        image_url: artist.image_url || null,
        profile_image_url: artist.profile_image_url || null,
        banner_image_url: artist.banner_image_url || null
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  const importAlbum = async (album) => {
    const { data: existing } = await supabase
      .from('albums')
      .select('id')
      .eq('deezer_album_id', album.deezer_album_id)
      .single();
    if (existing?.id) throw new Error('Album already imported.');

    let artistId = null;
    if (album.artist) {
      const artist = await upsertArtist(album.artist);
      artistId = artist.id;
    }

    const { data: created, error } = await supabase
      .from('albums')
      .insert({
        title: album.title,
        artist_id: artistId,
        cover_url: album.cover_url || null,
        cover_image_url: album.cover_image_url || null,
        release_date: album.release_date || null,
        deezer_album_id: album.deezer_album_id
      })
      .select()
      .single();
    if (error) throw error;

    if (album.tracks?.length) {
      for (const track of album.tracks) {
        await importTrack({ ...track, album_id: created.id });
      }
    }
    return created;
  };

  const importTrack = async (track) => {
    const { data: existing } = await supabase
      .from('tracks')
      .select('id')
      .eq('deezer_track_id', track.deezer_track_id)
      .single();
    if (existing?.id) throw new Error('Track already imported.');

    let albumId = track.album_id;
    if (!albumId && track.album) {
      const { data: existingAlbum } = await supabase
        .from('albums')
        .select('id')
        .eq('deezer_album_id', track.album.deezer_album_id)
        .single();
      if (existingAlbum?.id) {
        albumId = existingAlbum.id;
      } else {
        const createdAlbum = await importAlbum(track.album);
        albumId = createdAlbum?.id || null;
      }
    }

    const { data: created, error } = await supabase
      .from('tracks')
      .insert({
        title: track.title,
        album_id: albumId,
        duration_seconds: track.duration_seconds || null,
        preview_url: track.preview_url || null,
        deezer_track_id: track.deezer_track_id
      })
      .select()
      .single();
    if (error) throw error;

    if (track.artist) {
      const artist = await upsertArtist(track.artist);
      await supabase.from('track_artists').insert({
        track_id: created.id,
        artist_id: artist.id,
        role: 'artist'
      });
    }
  };

  const modalContent = useMemo(() => {
    if (!selected) return null;
    if (selected.type === 'artist') {
      return (
        <div className="space-y-3">
          <input
            value={selected.edit.name}
            onChange={(e) => setSelected((prev) => ({ ...prev, edit: { ...prev.edit, name: e.target.value } }))}
            className="w-full bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
          />
          <input
            value={selected.edit.image_url}
            onChange={(e) => setSelected((prev) => ({ ...prev, edit: { ...prev.edit, image_url: e.target.value } }))}
            placeholder="Image URL"
            className="w-full bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
          />
        </div>
      );
    }
    if (selected.type === 'album') {
      return (
        <div className="space-y-3">
          <input
            value={selected.edit.title}
            onChange={(e) => setSelected((prev) => ({ ...prev, edit: { ...prev.edit, title: e.target.value } }))}
            className="w-full bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
          />
          <input
            value={selected.edit.cover_url}
            onChange={(e) => setSelected((prev) => ({ ...prev, edit: { ...prev.edit, cover_url: e.target.value } }))}
            placeholder="Cover URL"
            className="w-full bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
          />
          <input
            value={selected.edit.release_date || ''}
            onChange={(e) => setSelected((prev) => ({ ...prev, edit: { ...prev.edit, release_date: e.target.value } }))}
            placeholder="Release date"
            className="w-full bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
          />
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <input
          value={selected.edit.title}
          onChange={(e) => setSelected((prev) => ({ ...prev, edit: { ...prev.edit, title: e.target.value } }))}
          className="w-full bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
        />
        <input
          value={selected.edit.duration_seconds || ''}
          onChange={(e) => setSelected((prev) => ({ ...prev, edit: { ...prev.edit, duration_seconds: Number(e.target.value) } }))}
          placeholder="Duration (sec)"
          className="w-full bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
        />
        <input
          value={selected.edit.preview_url || ''}
          onChange={(e) => setSelected((prev) => ({ ...prev, edit: { ...prev.edit, preview_url: e.target.value } }))}
          placeholder="Preview URL"
          className="w-full bg-[#111] border border-gray-800 rounded-md px-3 py-2 text-sm"
        />
      </div>
    );
  }, [selected]);

  return (
    <AdminLayout title="Deezer Import" subtitle="Search and import Deezer music metadata.">
      <div className="px-4 pt-6 space-y-6">
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-md p-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {TYPES.map((t) => (
              <button
                key={t}
                className={`px-3 py-1 rounded text-xs ${
                  type === t ? 'bg-[#F5C518] text-black' : 'bg-[#111] text-white'
                }`}
                onClick={() => {
                  setType(t);
                  setResults([]);
                  setExistingIds(new Set());
                }}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={`Search Deezer ${type}s`}
            className="w-full h-11 bg-[#111] border border-gray-800 rounded-md px-3 text-sm"
          />
          {loading && <p className="text-xs text-gray-400 mt-2">Loading...</p>}
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((item) => (
            <button
              key={item.id}
              className="text-left bg-[#1a1a1a] border border-gray-800 rounded-md p-3 hover:border-[#F5C518] transition"
              onClick={() => handleSelect(item)}
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-md overflow-hidden bg-[#111]">
                  <img
                    src={item.picture_medium || item.cover_medium || item.album?.cover_medium || ''}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title || item.name}</p>
                  <p className="text-xs text-gray-400">
                    {item.artist?.name || item.type}
                  </p>
                  {existingIds.has(item.id) && (
                    <span className="inline-block mt-2 text-[10px] px-2 py-0.5 bg-[#2a2a2a] rounded">
                      Already Imported
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
          {!loading && results.length === 0 && query && (
            <div className="text-sm text-gray-400">No results found.</div>
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button className="absolute inset-0 bg-black/70" onClick={() => setSelected(null)} aria-label="Close" />
          <div className="relative w-full max-w-lg bg-[#141414] border border-gray-800 rounded-md p-5 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Import Preview</h2>
              <button onClick={() => setSelected(null)} className="text-xs text-gray-400">Close</button>
            </div>
            {modalContent}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="btn-secondary h-9 px-3" onClick={() => setSelected(null)}>Cancel</button>
              <button className="btn-primary h-9 px-4" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-2 rounded-md text-sm ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </AdminLayout>
  );
};

export default DeezerImport;
