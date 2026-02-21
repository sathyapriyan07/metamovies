import { useState } from 'react';
import { getMovieDetails, getImageUrl, getPersonDetails, searchMovies, searchPerson } from '../../services/tmdb';
import { createMovie, createPerson, createCast, createCrew, supabase } from '../../services/supabase';
import AdminLayout from '../../components/AdminLayout';

const TMDBImport = () => {
  const [tmdbId, setTmdbId] = useState('');
  const [type, setType] = useState('movie');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [bulkIds, setBulkIds] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, status: '' });
  const [bulkSearchQuery, setBulkSearchQuery] = useState('');
  const [bulkSearchResults, setBulkSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const crewJobs = new Set([
    'Director',
    'Writer',
    'Screenplay',
    'Producer',
    'Executive Producer',
    'Original Music Composer',
    'Music Composer',
    'Composer'
  ]);

  const mapWithConcurrency = async (items, limit, fn) => {
    const results = [];
    let index = 0;
    const workers = new Array(limit).fill(null).map(async () => {
      while (index < items.length) {
        const current = index;
        index += 1;
        results[current] = await fn(items[current]);
      }
    });
    await Promise.all(workers);
    return results;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const results = type === 'movie' ? await searchMovies(searchQuery) : await searchPerson(searchQuery);
      setSearchResults(results.slice(0, 20));
    } catch (err) {
      setError('Search failed. Please try again.');
    }
    setLoading(false);
  };

  const handleBulkSearch = async () => {
    if (!bulkSearchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const results = type === 'movie' ? await searchMovies(bulkSearchQuery) : await searchPerson(bulkSearchQuery);
      setBulkSearchResults(results.slice(0, 20));
    } catch (err) {
      setError('Search failed. Please try again.');
    }
    setLoading(false);
  };

  const handleFetch = async () => {
    if (!tmdbId) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = type === 'movie' ? await getMovieDetails(tmdbId) : await getPersonDetails(tmdbId);
      setPreview(data);
    } catch (err) {
      setError('Failed to fetch from TMDB. Check the ID and try again.');
    }
    setLoading(false);
  };

  const handleSelectFromSearch = async (item) => {
    setTmdbId(String(item.id));
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = type === 'movie' ? await getMovieDetails(item.id) : await getPersonDetails(item.id);
      setPreview(data);
    } catch (err) {
      setError('Failed to fetch details. Please try again.');
    }
    setLoading(false);
  };

  const handleImport = async () => {
    if (!preview) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (type === 'movie') {
        const moviePayload = {
          tmdb_id: preview.id,
          title: preview.title,
          overview: preview.overview || null,
          release_date: preview.release_date || null,
          runtime: preview.runtime || null,
          rating: typeof preview.vote_average === 'number' ? Number(preview.vote_average.toFixed(1)) : null,
          poster_url: getImageUrl(preview.poster_path, 'w500'),
          backdrop_url: getImageUrl(preview.backdrop_path, 'original'),
          genres: preview.genres?.map((g) => g.name) || [],
          trailer_url: (() => {
            const trailer = preview.videos?.results?.find(
              (v) => v.site === 'YouTube' && v.type === 'Trailer'
            );
            return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
          })()
        };
        const { data: movie } = await createMovie(moviePayload);
        const credits = preview.credits || { cast: [], crew: [] };
        console.log('TMDB credits fetched:', {
          cast: credits.cast?.length || 0,
          crew: credits.crew?.length || 0
        });

        if (movie?.id) {
          await supabase.from('cast').delete().eq('movie_id', movie.id);
          await supabase.from('crew').delete().eq('movie_id', movie.id);

          const cast = (credits.cast || []).slice(0, 20);
          const crew = (credits.crew || []).filter((c) => crewJobs.has(c.job)).slice(0, 20);
          const personIds = Array.from(new Set([
            ...cast.map((c) => c.id),
            ...crew.map((c) => c.id)
          ]));

          const personCache = new Map();
          await mapWithConcurrency(personIds, 5, async (personId) => {
            if (personCache.has(personId)) return personCache.get(personId);
            const details = await getPersonDetails(personId);
            const payload = {
              tmdb_id: details.id,
              name: details.name,
              biography: details.biography || null,
              birthday: details.birthday || null,
              place_of_birth: details.place_of_birth || null,
              profile_url: getImageUrl(details.profile_path, 'w500'),
              social_links: {
                instagram: details.external_ids?.instagram_id ? `https://www.instagram.com/${details.external_ids.instagram_id}` : null,
                twitter: details.external_ids?.twitter_id ? `https://x.com/${details.external_ids.twitter_id}` : null,
                facebook: details.external_ids?.facebook_id ? `https://www.facebook.com/${details.external_ids.facebook_id}` : null,
                imdb: details.external_ids?.imdb_id ? `https://www.imdb.com/name/${details.external_ids.imdb_id}` : null
              }
            };
            const { data } = await supabase
              .from('persons')
              .upsert(payload, { onConflict: 'tmdb_id' })
              .select()
              .single();
            personCache.set(personId, data);
            return data;
          });

          console.log('Persons upserted:', personCache.size);

          await Promise.all(cast.map(async (member) => {
            const person = personCache.get(member.id);
            if (!person?.id) return;
            await createCast({
              movie_id: movie.id,
              person_id: person.id,
              character: member.character || null
            });
          }));

          await Promise.all(crew.map(async (member) => {
            const person = personCache.get(member.id);
            if (!person?.id) return;
            await createCrew({
              movie_id: movie.id,
              person_id: person.id,
              job: member.job || null
            });
          }));
        }
        setSuccess('Movie imported successfully.');
      } else {
        const personPayload = {
          tmdb_id: preview.id,
          name: preview.name,
          biography: preview.biography || null,
          birthday: preview.birthday || null,
          place_of_birth: preview.place_of_birth || null,
          profile_url: getImageUrl(preview.profile_path, 'w500'),
          social_links: {
            instagram: preview.external_ids?.instagram_id ? `https://www.instagram.com/${preview.external_ids.instagram_id}` : null,
            twitter: preview.external_ids?.twitter_id ? `https://x.com/${preview.external_ids.twitter_id}` : null,
            facebook: preview.external_ids?.facebook_id ? `https://www.facebook.com/${preview.external_ids.facebook_id}` : null
          }
        };
        await createPerson(personPayload);
        setSuccess('Person imported successfully.');
      }
      setPreview(null);
      setTmdbId('');
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      setError('Import failed. Please try again.');
    }
    setLoading(false);
  };

  const handleBulkImport = async () => {
    if (!bulkIds.trim()) return;
    const ids = bulkIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) return;

    setBulkLoading(true);
    setError('');
    setSuccess('');
    setBulkProgress({ current: 0, total: ids.length, status: 'Starting import...' });

    try {
      let current = 0;
      for (const id of ids) {
        current += 1;
        setBulkProgress({ current, total: ids.length, status: `Importing ${id}...` });

        const data = type === 'movie' ? await getMovieDetails(id) : await getPersonDetails(id);

        if (type === 'movie') {
          const moviePayload = {
            tmdb_id: data.id,
            title: data.title,
            overview: data.overview || null,
            release_date: data.release_date || null,
            runtime: data.runtime || null,
            rating: typeof data.vote_average === 'number' ? Number(data.vote_average.toFixed(1)) : null,
            poster_url: getImageUrl(data.poster_path, 'w500'),
            backdrop_url: getImageUrl(data.backdrop_path, 'original'),
            genres: data.genres?.map((g) => g.name) || [],
            trailer_url: (() => {
              const trailer = data.videos?.results?.find(
                (v) => v.site === 'YouTube' && v.type === 'Trailer'
              );
              return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
            })()
          };
          const { data: movie } = await createMovie(moviePayload);

          const credits = data.credits || { cast: [], crew: [] };
          console.log('TMDB credits fetched:', {
            cast: credits.cast?.length || 0,
            crew: credits.crew?.length || 0
          });

          if (movie?.id) {
            await supabase.from('cast').delete().eq('movie_id', movie.id);
            await supabase.from('crew').delete().eq('movie_id', movie.id);

            const cast = (credits.cast || []).slice(0, 20);
            const crew = (credits.crew || []).filter((c) => crewJobs.has(c.job)).slice(0, 20);
            const personIds = Array.from(new Set([
              ...cast.map((c) => c.id),
              ...crew.map((c) => c.id)
            ]));

            const personCache = new Map();
            await mapWithConcurrency(personIds, 5, async (personId) => {
              if (personCache.has(personId)) return personCache.get(personId);
              const details = await getPersonDetails(personId);
              const payload = {
                tmdb_id: details.id,
                name: details.name,
                biography: details.biography || null,
                birthday: details.birthday || null,
                place_of_birth: details.place_of_birth || null,
                profile_url: getImageUrl(details.profile_path, 'w500'),
                social_links: {
                  instagram: details.external_ids?.instagram_id ? `https://www.instagram.com/${details.external_ids.instagram_id}` : null,
                  twitter: details.external_ids?.twitter_id ? `https://x.com/${details.external_ids.twitter_id}` : null,
                  facebook: details.external_ids?.facebook_id ? `https://www.facebook.com/${details.external_ids.facebook_id}` : null,
                  imdb: details.external_ids?.imdb_id ? `https://www.imdb.com/name/${details.external_ids.imdb_id}` : null
                }
              };
              const { data: person } = await supabase
                .from('persons')
                .upsert(payload, { onConflict: 'tmdb_id' })
                .select()
                .single();
              personCache.set(personId, person);
              return person;
            });

            console.log('Persons upserted:', personCache.size);

            await Promise.all(cast.map(async (member) => {
              const person = personCache.get(member.id);
              if (!person?.id) return;
              await createCast({
                movie_id: movie.id,
                person_id: person.id,
                character: member.character || null
              });
            }));

            await Promise.all(crew.map(async (member) => {
              const person = personCache.get(member.id);
              if (!person?.id) return;
              await createCrew({
                movie_id: movie.id,
                person_id: person.id,
                job: member.job || null
              });
            }));
          }
        } else {
          const personPayload = {
            tmdb_id: data.id,
            name: data.name,
            biography: data.biography || null,
            birthday: data.birthday || null,
            place_of_birth: data.place_of_birth || null,
            profile_url: getImageUrl(data.profile_path, 'w500'),
            social_links: {
              instagram: data.external_ids?.instagram_id ? `https://www.instagram.com/${data.external_ids.instagram_id}` : null,
              twitter: data.external_ids?.twitter_id ? `https://x.com/${data.external_ids.twitter_id}` : null,
              facebook: data.external_ids?.facebook_id ? `https://www.facebook.com/${data.external_ids.facebook_id}` : null
            }
          };
          await createPerson(personPayload);
        }
      }

      setSuccess(`Imported ${ids.length} item(s) successfully.`);
      setBulkIds('');
      setBulkSearchResults([]);
      setSelectedItems([]);
      setBulkSearchQuery('');
    } catch (err) {
      setError('Bulk import failed. Please try again.');
    }

    setBulkLoading(false);
    setBulkProgress({ current: 0, total: 0, status: '' });
  };

  const toggleSelectItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const addSelectedToBulk = () => {
    const ids = selectedItems.map(item => item.id).join(', ');
    setBulkIds(prev => prev ? `${prev}, ${ids}` : ids);
    setSelectedItems([]);
    setBulkSearchResults([]);
    setBulkSearchQuery('');
  };

  return (
    <AdminLayout title="TMDB Import" subtitle="Import movies and people from TMDB.">
      <div className="glass-card rounded-2xl p-6">

        <div className="tab-container admin-tabs" style={{ marginBottom: 16 }}>
          <button
            onClick={() => document.getElementById('single-import').scrollIntoView({ behavior: 'smooth' })}
            className="tab tab-admin-toggle"
          >
            Single Import
          </button>
          <button
            onClick={() => document.getElementById('bulk-import').scrollIntoView({ behavior: 'smooth' })}
            className="tab tab-admin-toggle"
          >
            Bulk Import
          </button>
        </div>

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-500 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div id="bulk-import" className="admin-section">
          <h3>Bulk Import</h3>
          <p className="text-gray-400 text-sm mb-4">Import multiple movies at once using comma-separated TMDB IDs</p>

          <div className="admin-grid">
            <div className="admin-field">
              <label className="block text-sm font-medium">Type</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setBulkSearchResults([]); setSelectedItems([]); }}
                className="w-full px-4 py-3 glass-input"
                disabled={bulkLoading}
              >
                <option value="movie" className="bg-black">Movies</option>
                <option value="person" className="bg-black">Persons</option>
              </select>
            </div>

            <div className="admin-field admin-full">
              <label className="block text-sm font-medium">Search & Select Multiple</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bulkSearchQuery}
                  onChange={(e) => setBulkSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBulkSearch()}
                  placeholder="Search to add multiple items..."
                  className="flex-1 px-4 py-3 glass-input"
                  disabled={bulkLoading}
                />
                <button
                  onClick={handleBulkSearch}
                  className="btn-secondary"
                  disabled={loading || bulkLoading || !bulkSearchQuery.trim()}
                >
                  Search
                </button>
              </div>
            </div>

            {bulkSearchResults.length > 0 && (
              <div className="admin-field admin-full">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">{selectedItems.length} selected</p>
                  {selectedItems.length > 0 && (
                    <button
                      onClick={addSelectedToBulk}
                      className="btn-primary text-sm px-3 py-1"
                    >
                      Add {selectedItems.length} to List
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {bulkSearchResults.map((item) => {
                    const isSelected = selectedItems.find(i => i.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelectItem(item)}
                        className={`flex gap-3 p-3 rounded-lg cursor-pointer transition ${
                          isSelected ? 'bg-blue-500/30 border border-blue-500' : 'bg-white/5 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => {}}
                          className="mt-1"
                        />
                        <img
                          src={type === 'person' ? getImageUrl(item.profile_path, 'w92') : getImageUrl(item.poster_path, 'w92')}
                          alt={item.title || item.name}
                          className="w-12 h-18 object-cover rounded"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/92x138'}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.title || item.name}</p>
                          <p className="text-xs text-gray-400">{type === 'person' ? item.known_for_department : (item.release_date || item.first_air_date)}</p>
                          <p className="text-xs text-gray-500">ID: {item.id}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="admin-field admin-full">
              <label className="block text-sm font-medium">TMDB IDs (comma-separated)</label>
              <textarea
                value={bulkIds}
                onChange={(e) => setBulkIds(e.target.value)}
                placeholder="e.g., 550, 680, 13, 155, 497"
                rows="4"
                className="w-full px-4 py-3 glass-input"
                disabled={bulkLoading}
              />
              <p className="text-xs text-gray-500 mt-1">Enter TMDB IDs separated by commas</p>
            </div>

            {bulkLoading && (
              <div className="bg-blue-500/20 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg">
                <p className="font-semibold">Progress: {bulkProgress.current} / {bulkProgress.total}</p>
                <p className="text-sm">{bulkProgress.status}</p>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

          </div>
          <div className="admin-actions" style={{ marginTop: 12 }}>
            <button
              onClick={handleBulkImport}
              className="btn-primary"
              disabled={bulkLoading || !bulkIds.trim()}
            >
              {bulkLoading ? 'Importing...' : 'Start Bulk Import'}
            </button>
          </div>
        </div>

        <div id="single-import" className="admin-section">
          <h3>Single Import</h3>
          <div className="admin-grid">
            <div className="admin-field">
              <label className="block text-sm font-medium">Type</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setSearchResults([]); }}
                className="w-full px-4 py-3 glass-input"
              >
                <option value="movie" className="bg-black">Movie</option>
                <option value="person" className="bg-black">Person</option>
              </select>
            </div>

            <div className="admin-field admin-full">
              <label className="block text-sm font-medium">Search TMDB</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for movies..."
                  className="flex-1 px-4 py-3 glass-input"
                />
                <button
                  onClick={handleSearch}
                  className="btn-secondary"
                  disabled={loading || !searchQuery.trim()}
                >
                  Search
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="admin-field admin-full">
                <div className="max-h-80 overflow-y-auto space-y-2">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectFromSearch(item)}
                    className="flex gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition"
                  >
                    <img
                      src={type === 'person' ? getImageUrl(item.profile_path, 'w92') : getImageUrl(item.poster_path, 'w92')}
                      alt={item.title || item.name}
                      className="w-12 h-18 object-cover rounded"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/92x138'}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.title || item.name}</p>
                      <p className="text-xs text-gray-400">{type === 'person' ? item.known_for_department : (item.release_date || item.first_air_date)}</p>
                      <p className="text-xs text-gray-500">ID: {item.id}</p>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}

            <div className="admin-field admin-full">
              <label className="block text-sm font-medium">Or Enter TMDB ID Manually</label>
              <input
                type="text"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                placeholder="Enter TMDB ID (e.g., 550 for Fight Club)"
                className="w-full px-4 py-3 glass-input"
              />
              <div className="admin-actions" style={{ marginTop: 12 }}>
                <button
                  onClick={() => handleFetch()}
                  className="btn-primary"
                  disabled={loading || !tmdbId}
                >
                  {loading ? 'Fetching...' : 'Fetch from TMDB'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {preview && (
          <div className="admin-section">
            <h3>Preview</h3>
            
            <div className="flex gap-6 mb-6">
              <img
                src={type === 'person' ? getImageUrl(preview.profile_path, 'w300') : getImageUrl(preview.poster_path, 'w300')}
                alt={preview.title || preview.name}
                className="w-32 rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{preview.title || preview.name}</h3>
                <p className="text-gray-400 text-sm mb-2">
                  {type === 'person' ? preview.known_for_department : (preview.release_date || preview.first_air_date)}
                </p>
                <p className="text-sm line-clamp-3">{type === 'person' ? preview.biography : preview.overview}</p>
              </div>
            </div>

            <button
              onClick={handleImport}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Importing...' : 'Import to Database'}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TMDBImport;


