import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { apiProviders, searchItunes } from '../../services/musicApis';
import { supabase } from '../../services/supabase';

const debounceMs = 400;

const MusicImport = () => {
  const [provider, setProvider] = useState('itunes');
  const [entity, setEntity] = useState('song');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        if (provider === 'itunes') {
          const items = await searchItunes(query, entity, 20);
          setResults(items);
        } else {
          setResults([]);
          setError('This provider is not enabled yet.');
        }
      } catch {
        setError('Search failed. Please try again.');
      }
      setLoading(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, provider]);

  const importItem = async (item) => {
    setImportingId(item.id);
    setError('');
    setSuccess('');

    try {
      const artistName = (item.artist || '').trim();
      const albumTitle = (item.album || '').trim();

      let artistId = null;
      if (artistName) {
        const { data: existingArtist } = await supabase
          .from('artists')
          .select('*')
          .eq('name', artistName)
          .single();
        if (existingArtist?.id) {
          artistId = existingArtist.id;
        } else {
          const { data: createdArtist } = await supabase
            .from('artists')
            .insert({
              name: artistName,
              profile_image_url: null,
              banner_image_url: null,
              bio: null,
              import_source: provider,
              is_imported: true,
              last_synced_at: new Date().toISOString()
            })
            .select()
            .single();
          artistId = createdArtist?.id || null;
        }
      }

      let albumId = null;
      if (albumTitle && artistId) {
        const { data: existingAlbum } = await supabase
          .from('albums')
          .select('*')
          .eq('title', albumTitle)
          .eq('artist_id', artistId)
          .single();
        if (existingAlbum?.id) {
          albumId = existingAlbum.id;
        } else {
          const { data: createdAlbum } = await supabase
            .from('albums')
            .insert({
              title: albumTitle,
              artist_id: artistId,
              cover_image_url: item.cover_url || null,
              release_year: item.release_year || null,
              import_source: provider,
              is_imported: true,
              last_synced_at: new Date().toISOString()
            })
            .select()
            .single();
          albumId = createdAlbum?.id || null;
        }
      }

      if (item.type === 'track') {
        const { error: trackError } = await supabase.from('tracks').insert({
          album_id: albumId,
          title: item.title,
          duration_seconds: item.duration_seconds || null,
          preview_url: item.preview_url || null,
          artwork_url: item.cover_url || null,
          spotify_url: null,
          apple_music_url: null,
          youtube_music_url: null,
          amazon_music_url: null,
          import_source: provider,
          is_imported: true,
          last_synced_at: new Date().toISOString()
        });

        if (trackError) {
          throw trackError;
        }
      }

      setSuccess(item.type === 'album' ? 'Album imported successfully.' : item.type === 'artist' ? 'Artist imported successfully.' : 'Track imported successfully.');
    } catch {
      setError('Import failed. Please try again.');
    }

    setImportingId(null);
  };

  const providerOptions = useMemo(() => apiProviders, []);

  return (
    <AdminLayout title="Music Import" subtitle="Import tracks, albums, and artists from a free music API.">
      <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="grid md:grid-cols-[200px_1fr] gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
              >
              {providerOptions.map((p) => (
                <option key={p.id} value={p.id} className="bg-black">
                  {p.label}{p.supported ? '' : ' (Soon)'}
                </option>
              ))}
            </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search songs, albums, or artists..."
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-[200px_1fr] gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={entity}
                onChange={(e) => setEntity(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
              >
                <option value="song" className="bg-black">Song</option>
                <option value="album" className="bg-black">Album</option>
                <option value="musicArtist" className="bg-black">Artist</option>
              </select>
            </div>
            <div className="text-xs text-gray-400 flex items-end">
              Results are limited to 20 and debounced for performance.
            </div>
          </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-gray-400">Loading results...</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item) => (
              <div key={`${item.api}-${item.id}`} className="glass-dark p-4 rounded-2xl border border-white/10">
                {item.cover_url ? (
                  <img
                    src={item.cover_url}
                    alt={item.title}
                    className="w-full aspect-square object-cover rounded-xl mb-3"
                    loading="lazy"
                  />
                ) : null}
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="text-xs text-gray-400">{item.artist || 'Unknown Artist'}</p>
                <p className="text-xs text-gray-500">{item.album || 'Unknown Album'}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                  <span>{item.release_year || '—'}</span>
                  <span>{item.duration_seconds ? `${Math.floor(item.duration_seconds / 60)}:${(item.duration_seconds % 60).toString().padStart(2, '0')}` : '—'}</span>
                </div>
                <button
                  onClick={() => importItem(item)}
                  disabled={importingId === item.id}
                  className="btn-primary w-full mt-4"
                >
                  {importingId === item.id ? 'Importing...' : 'Import'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MusicImport;
