import { useState } from 'react';
import { getMovieDetails, getSeriesDetails, getSeasonDetails, getImageUrl, getPersonDetails, searchMovies, searchSeries } from '../../services/tmdb';
import { createMovie, createSeries, createCast, createCrew, createSeason, createEpisode, createPerson } from '../../services/supabase';
import { supabase } from '../../services/supabase';

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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const results = type === 'movie' 
        ? await searchMovies(searchQuery)
        : await searchSeries(searchQuery);
      setSearchResults(results.slice(0, 10));
    } catch (err) {
      setError('Search failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleSelectFromSearch = (item) => {
    setTmdbId(item.id.toString());
    setSearchResults([]);
    setSearchQuery('');
    handleFetch(item.id);
  };

  const handleFetch = async (id = null) => {
    const fetchId = id || tmdbId;
    if (!fetchId) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const data = type === 'movie' 
        ? await getMovieDetails(fetchId)
        : await getSeriesDetails(fetchId);
      
      setPreview(data);
    } catch (err) {
      setError('Failed to fetch from TMDB. Check the ID and try again.');
    }
    
    setLoading(false);
  };

  const handleImport = async () => {
    if (!preview) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (type === 'movie') {
        // Import movie
        const movieData = {
          tmdb_id: preview.id,
          title: preview.title,
          overview: preview.overview,
          release_date: preview.release_date,
          runtime: preview.runtime,
          rating: preview.vote_average,
          poster_url: getImageUrl(preview.poster_path),
          backdrop_url: getImageUrl(preview.backdrop_path),
          genres: preview.genres.map(g => g.name),
          trailer_url: preview.videos?.results?.[0] ? `https://youtube.com/watch?v=${preview.videos.results[0].key}` : null,
          trending: false
        };
        
        const { data: movie, error: movieError } = await createMovie(movieData);
        if (movieError) throw movieError;
        
        // Import cast
        for (const cast of preview.credits.cast.slice(0, 10)) {
          // Check if person already exists
          const { data: existingPerson } = await supabase
            .from('persons')
            .select('id')
            .eq('tmdb_id', cast.id)
            .single();
          
          let personId = existingPerson?.id;
          
          if (!personId) {
            // Fetch full person details from TMDB
            const personDetails = await getPersonDetails(cast.id);
            
            const personData = {
              tmdb_id: cast.id,
              name: cast.name,
              profile_url: getImageUrl(cast.profile_path),
              biography: personDetails.biography,
              birthday: personDetails.birthday,
              place_of_birth: personDetails.place_of_birth,
              social_links: {
                instagram: personDetails.external_ids?.instagram_id ? `https://instagram.com/${personDetails.external_ids.instagram_id}` : null,
                twitter: personDetails.external_ids?.twitter_id ? `https://twitter.com/${personDetails.external_ids.twitter_id}` : null,
                facebook: personDetails.external_ids?.facebook_id ? `https://facebook.com/${personDetails.external_ids.facebook_id}` : null
              }
            };
            const { data: person } = await createPerson(personData);
            personId = person?.id;
          }
          
          if (personId) {
            await createCast({
              movie_id: movie.id,
              person_id: personId,
              character: cast.character
            });
          }
        }
        
        // Import crew
        for (const crew of preview.credits.crew.slice(0, 5)) {
          // Check if person already exists
          const { data: existingPerson } = await supabase
            .from('persons')
            .select('id')
            .eq('tmdb_id', crew.id)
            .single();
          
          let personId = existingPerson?.id;
          
          if (!personId) {
            // Fetch full person details from TMDB
            const personDetails = await getPersonDetails(crew.id);
            
            const personData = {
              tmdb_id: crew.id,
              name: crew.name,
              profile_url: getImageUrl(crew.profile_path),
              biography: personDetails.biography,
              birthday: personDetails.birthday,
              place_of_birth: personDetails.place_of_birth,
              social_links: {
                instagram: personDetails.external_ids?.instagram_id ? `https://instagram.com/${personDetails.external_ids.instagram_id}` : null,
                twitter: personDetails.external_ids?.twitter_id ? `https://twitter.com/${personDetails.external_ids.twitter_id}` : null,
                facebook: personDetails.external_ids?.facebook_id ? `https://facebook.com/${personDetails.external_ids.facebook_id}` : null
              }
            };
            const { data: person } = await createPerson(personData);
            personId = person?.id;
          }
          
          if (personId) {
            await createCrew({
              movie_id: movie.id,
              person_id: personId,
              job: crew.job
            });
          }
        }
        
        setSuccess('Movie imported successfully!');
      } else {
        // Import series
        const seriesData = {
          tmdb_id: preview.id,
          title: preview.name,
          overview: preview.overview,
          first_air_date: preview.first_air_date,
          rating: preview.vote_average,
          poster_url: getImageUrl(preview.poster_path),
          backdrop_url: getImageUrl(preview.backdrop_path),
          genres: preview.genres.map(g => g.name),
          trailer_url: preview.videos?.results?.[0] ? `https://youtube.com/watch?v=${preview.videos.results[0].key}` : null,
          trending: false
        };
        
        const { data: series, error: seriesError } = await createSeries(seriesData);
        if (seriesError) throw seriesError;
        
        // Import cast
        for (const cast of preview.credits.cast.slice(0, 10)) {
          // Check if person already exists
          const { data: existingPerson } = await supabase
            .from('persons')
            .select('id')
            .eq('tmdb_id', cast.id)
            .single();
          
          let personId = existingPerson?.id;
          
          if (!personId) {
            // Fetch full person details from TMDB
            const personDetails = await getPersonDetails(cast.id);
            
            const personData = {
              tmdb_id: cast.id,
              name: cast.name,
              profile_url: getImageUrl(cast.profile_path),
              biography: personDetails.biography,
              birthday: personDetails.birthday,
              place_of_birth: personDetails.place_of_birth,
              social_links: {
                instagram: personDetails.external_ids?.instagram_id ? `https://instagram.com/${personDetails.external_ids.instagram_id}` : null,
                twitter: personDetails.external_ids?.twitter_id ? `https://twitter.com/${personDetails.external_ids.twitter_id}` : null,
                facebook: personDetails.external_ids?.facebook_id ? `https://facebook.com/${personDetails.external_ids.facebook_id}` : null
              }
            };
            const { data: person } = await createPerson(personData);
            personId = person?.id;
          }
          
          if (personId) {
            await createCast({
              series_id: series.id,
              person_id: personId,
              character: cast.character
            });
          }
        }
        
        // Import crew
        for (const crew of preview.credits.crew.slice(0, 5)) {
          // Check if person already exists
          const { data: existingPerson } = await supabase
            .from('persons')
            .select('id')
            .eq('tmdb_id', crew.id)
            .single();
          
          let personId = existingPerson?.id;
          
          if (!personId) {
            // Fetch full person details from TMDB
            const personDetails = await getPersonDetails(crew.id);
            
            const personData = {
              tmdb_id: crew.id,
              name: crew.name,
              profile_url: getImageUrl(crew.profile_path),
              biography: personDetails.biography,
              birthday: personDetails.birthday,
              place_of_birth: personDetails.place_of_birth,
              social_links: {
                instagram: personDetails.external_ids?.instagram_id ? `https://instagram.com/${personDetails.external_ids.instagram_id}` : null,
                twitter: personDetails.external_ids?.twitter_id ? `https://twitter.com/${personDetails.external_ids.twitter_id}` : null,
                facebook: personDetails.external_ids?.facebook_id ? `https://facebook.com/${personDetails.external_ids.facebook_id}` : null
              }
            };
            const { data: person } = await createPerson(personData);
            personId = person?.id;
          }
          
          if (personId) {
            await createCrew({
              series_id: series.id,
              person_id: personId,
              job: crew.job
            });
          }
        }
        
        // Import seasons (first 3 seasons only for demo)
        for (const season of preview.seasons.slice(0, 3)) {
          if (season.season_number === 0) continue; // Skip specials
          
          const seasonData = {
            series_id: series.id,
            season_number: season.season_number,
            name: season.name,
            overview: season.overview,
            poster_url: getImageUrl(season.poster_path),
            air_date: season.air_date
          };
          const { data: createdSeason } = await createSeason(seasonData);
          
          // Fetch and import episodes for this season
          if (createdSeason) {
            const seasonDetails = await getSeasonDetails(preview.id, season.season_number);
            for (const episode of seasonDetails.episodes) {
              const episodeData = {
                season_id: createdSeason.id,
                episode_number: episode.episode_number,
                title: episode.name,
                overview: episode.overview,
                still_url: getImageUrl(episode.still_path),
                air_date: episode.air_date,
                runtime: episode.runtime
              };
              await createEpisode(episodeData);
            }
          }
        }
        
        setSuccess('Series imported successfully!');
      }
      
      setPreview(null);
      setTmdbId('');
    } catch (err) {
      setError('Failed to import. Please try again.');
    }
    
    setLoading(false);
  };

  const handleBulkImport = async () => {
    if (!bulkIds.trim()) return;
    
    const ids = bulkIds.split(',').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) return;
    
    setBulkLoading(true);
    setError('');
    setSuccess('');
    setBulkProgress({ current: 0, total: ids.length, status: '' });
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      setBulkProgress({ current: i + 1, total: ids.length, status: `Importing ${type} ${id}...` });
      
      try {
        const data = type === 'movie' 
          ? await getMovieDetails(id)
          : await getSeriesDetails(id);
        
        if (type === 'movie') {
          const movieData = {
            tmdb_id: data.id,
            title: data.title,
            overview: data.overview,
            release_date: data.release_date,
            runtime: data.runtime,
            rating: data.vote_average,
            poster_url: getImageUrl(data.poster_path),
            backdrop_url: getImageUrl(data.backdrop_path),
            genres: data.genres.map(g => g.name),
            trailer_url: data.videos?.results?.[0] ? `https://youtube.com/watch?v=${data.videos.results[0].key}` : null,
            trending: false
          };
          
          const { data: movie, error: movieError } = await createMovie(movieData);
          if (movieError) throw movieError;
          
          for (const cast of data.credits.cast.slice(0, 10)) {
            const { data: existingPerson } = await supabase
              .from('persons')
              .select('id')
              .eq('tmdb_id', cast.id)
              .single();
            
            let personId = existingPerson?.id;
            
            if (!personId) {
              const personDetails = await getPersonDetails(cast.id);
              const personData = {
                tmdb_id: cast.id,
                name: cast.name,
                profile_url: getImageUrl(cast.profile_path),
                biography: personDetails.biography,
                birthday: personDetails.birthday,
                place_of_birth: personDetails.place_of_birth,
                social_links: {
                  instagram: personDetails.external_ids?.instagram_id ? `https://instagram.com/${personDetails.external_ids.instagram_id}` : null,
                  twitter: personDetails.external_ids?.twitter_id ? `https://twitter.com/${personDetails.external_ids.twitter_id}` : null,
                  facebook: personDetails.external_ids?.facebook_id ? `https://facebook.com/${personDetails.external_ids.facebook_id}` : null
                }
              };
              const { data: person } = await createPerson(personData);
              personId = person?.id;
            }
            
            if (personId) {
              await createCast({
                movie_id: movie.id,
                person_id: personId,
                character: cast.character
              });
            }
          }
          
          for (const crew of data.credits.crew.slice(0, 5)) {
            const { data: existingPerson } = await supabase
              .from('persons')
              .select('id')
              .eq('tmdb_id', crew.id)
              .single();
            
            let personId = existingPerson?.id;
            
            if (!personId) {
              const personDetails = await getPersonDetails(crew.id);
              const personData = {
                tmdb_id: crew.id,
                name: crew.name,
                profile_url: getImageUrl(crew.profile_path),
                biography: personDetails.biography,
                birthday: personDetails.birthday,
                place_of_birth: personDetails.place_of_birth,
                social_links: {
                  instagram: personDetails.external_ids?.instagram_id ? `https://instagram.com/${personDetails.external_ids.instagram_id}` : null,
                  twitter: personDetails.external_ids?.twitter_id ? `https://twitter.com/${personDetails.external_ids.twitter_id}` : null,
                  facebook: personDetails.external_ids?.facebook_id ? `https://facebook.com/${personDetails.external_ids.facebook_id}` : null
                }
              };
              const { data: person } = await createPerson(personData);
              personId = person?.id;
            }
            
            if (personId) {
              await createCrew({
                movie_id: movie.id,
                person_id: personId,
                job: crew.job
              });
            }
          }
        } else {
          const seriesData = {
            tmdb_id: data.id,
            title: data.name,
            overview: data.overview,
            first_air_date: data.first_air_date,
            rating: data.vote_average,
            poster_url: getImageUrl(data.poster_path),
            backdrop_url: getImageUrl(data.backdrop_path),
            genres: data.genres.map(g => g.name),
            trailer_url: data.videos?.results?.[0] ? `https://youtube.com/watch?v=${data.videos.results[0].key}` : null,
            trending: false
          };
          
          const { data: series, error: seriesError } = await createSeries(seriesData);
          if (seriesError) throw seriesError;
          
          for (const cast of data.credits.cast.slice(0, 10)) {
            const { data: existingPerson } = await supabase
              .from('persons')
              .select('id')
              .eq('tmdb_id', cast.id)
              .single();
            
            let personId = existingPerson?.id;
            
            if (!personId) {
              const personDetails = await getPersonDetails(cast.id);
              const personData = {
                tmdb_id: cast.id,
                name: cast.name,
                profile_url: getImageUrl(cast.profile_path),
                biography: personDetails.biography,
                birthday: personDetails.birthday,
                place_of_birth: personDetails.place_of_birth,
                social_links: {
                  instagram: personDetails.external_ids?.instagram_id ? `https://instagram.com/${personDetails.external_ids.instagram_id}` : null,
                  twitter: personDetails.external_ids?.twitter_id ? `https://twitter.com/${personDetails.external_ids.twitter_id}` : null,
                  facebook: personDetails.external_ids?.facebook_id ? `https://facebook.com/${personDetails.external_ids.facebook_id}` : null
                }
              };
              const { data: person } = await createPerson(personData);
              personId = person?.id;
            }
            
            if (personId) {
              await createCast({
                series_id: series.id,
                person_id: personId,
                character: cast.character
              });
            }
          }
          
          for (const crew of data.credits.crew.slice(0, 5)) {
            const { data: existingPerson } = await supabase
              .from('persons')
              .select('id')
              .eq('tmdb_id', crew.id)
              .single();
            
            let personId = existingPerson?.id;
            
            if (!personId) {
              const personDetails = await getPersonDetails(crew.id);
              const personData = {
                tmdb_id: crew.id,
                name: crew.name,
                profile_url: getImageUrl(crew.profile_path),
                biography: personDetails.biography,
                birthday: personDetails.birthday,
                place_of_birth: personDetails.place_of_birth,
                social_links: {
                  instagram: personDetails.external_ids?.instagram_id ? `https://instagram.com/${personDetails.external_ids.instagram_id}` : null,
                  twitter: personDetails.external_ids?.twitter_id ? `https://twitter.com/${personDetails.external_ids.twitter_id}` : null,
                  facebook: personDetails.external_ids?.facebook_id ? `https://facebook.com/${personDetails.external_ids.facebook_id}` : null
                }
              };
              const { data: person } = await createPerson(personData);
              personId = person?.id;
            }
            
            if (personId) {
              await createCrew({
                series_id: series.id,
                person_id: personId,
                job: crew.job
              });
            }
          }
          
          for (const season of data.seasons.slice(0, 3)) {
            if (season.season_number === 0) continue;
            
            const seasonData = {
              series_id: series.id,
              season_number: season.season_number,
              name: season.name,
              overview: season.overview,
              poster_url: getImageUrl(season.poster_path),
              air_date: season.air_date
            };
            const { data: createdSeason } = await createSeason(seasonData);
            
            if (createdSeason) {
              const seasonDetails = await getSeasonDetails(data.id, season.season_number);
              for (const episode of seasonDetails.episodes) {
                const episodeData = {
                  season_id: createdSeason.id,
                  episode_number: episode.episode_number,
                  title: episode.name,
                  overview: episode.overview,
                  still_url: getImageUrl(episode.still_path),
                  air_date: episode.air_date,
                  runtime: episode.runtime
                };
                await createEpisode(episodeData);
              }
            }
          }
        }
        
        successCount++;
      } catch (err) {
        failCount++;
      }
    }
    
    setBulkProgress({ current: ids.length, total: ids.length, status: 'Complete' });
    setSuccess(`Bulk import complete! Success: ${successCount}, Failed: ${failCount}`);
    setBulkIds('');
    setBulkLoading(false);
  };

  const handleBulkSearch = async () => {
    if (!bulkSearchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = type === 'movie' 
        ? await searchMovies(bulkSearchQuery)
        : await searchSeries(bulkSearchQuery);
      setBulkSearchResults(results.slice(0, 20));
    } catch (err) {
      setError('Search failed. Please try again.');
    }
    setLoading(false);
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
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">TMDB Import</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => document.getElementById('single-import').scrollIntoView({ behavior: 'smooth' })}
            className="btn-secondary"
          >
            Single Import
          </button>
          <button
            onClick={() => document.getElementById('bulk-import').scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary"
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

        <div id="bulk-import" className="glass-dark p-6 rounded-xl mb-8">
          <h2 className="text-2xl font-bold mb-4">Bulk Import</h2>
          <p className="text-gray-400 text-sm mb-4">Import multiple {type === 'movie' ? 'movies' : 'series'} at once using comma-separated TMDB IDs</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setBulkSearchResults([]); setSelectedItems([]); }}
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
                disabled={bulkLoading}
              >
                <option value="movie" className="bg-black">Movies</option>
                <option value="series" className="bg-black">TV Series</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Search & Select Multiple</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={bulkSearchQuery}
                  onChange={(e) => setBulkSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBulkSearch()}
                  placeholder="Search to add multiple items..."
                  className="flex-1 px-4 py-3 bg-white/10 rounded-lg border border-white/20"
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
              <div className="space-y-2">
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
                          src={getImageUrl(item.poster_path, 'w92')}
                          alt={item.title || item.name}
                          className="w-12 h-18 object-cover rounded"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/92x138'}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.title || item.name}</p>
                          <p className="text-xs text-gray-400">{item.release_date || item.first_air_date}</p>
                          <p className="text-xs text-gray-500">ID: {item.id}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">TMDB IDs (comma-separated)</label>
              <textarea
                value={bulkIds}
                onChange={(e) => setBulkIds(e.target.value)}
                placeholder="e.g., 550, 680, 13, 155, 497"
                rows="4"
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
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

            <button
              onClick={handleBulkImport}
              className="btn-primary w-full"
              disabled={bulkLoading || !bulkIds.trim()}
            >
              {bulkLoading ? 'Importing...' : 'Start Bulk Import'}
            </button>
          </div>
        </div>

        <div id="single-import" className="glass-dark p-6 rounded-xl mb-6">
          <h2 className="text-2xl font-bold mb-4">Single Import</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setSearchResults([]); }}
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20"
              >
                <option value="movie" className="bg-black">Movie</option>
                <option value="series" className="bg-black">TV Series</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Search TMDB</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for movies or series..."
                  className="flex-1 px-4 py-3 bg-white/10 rounded-lg border border-white/20"
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
              <div className="max-h-80 overflow-y-auto space-y-2">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectFromSearch(item)}
                    className="flex gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition"
                  >
                    <img
                      src={getImageUrl(item.poster_path, 'w92')}
                      alt={item.title || item.name}
                      className="w-12 h-18 object-cover rounded"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/92x138'}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.title || item.name}</p>
                      <p className="text-xs text-gray-400">{item.release_date || item.first_air_date}</p>
                      <p className="text-xs text-gray-500">ID: {item.id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-white/20 pt-4">
              <label className="block text-sm font-medium mb-2">Or Enter TMDB ID Manually</label>
              <input
                type="text"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                placeholder="Enter TMDB ID (e.g., 550 for Fight Club)"
                className="w-full px-4 py-3 bg-white/10 rounded-lg border border-white/20 mb-3"
              />
              <button
                onClick={() => handleFetch()}
                className="btn-primary w-full"
                disabled={loading || !tmdbId}
              >
                {loading ? 'Fetching...' : 'Fetch from TMDB'}
              </button>
            </div>
          </div>
        </div>

        {preview && (
          <div className="glass-dark p-6 rounded-xl">
            <h2 className="text-2xl font-bold mb-4">Preview</h2>
            
            <div className="flex gap-6 mb-6">
              <img
                src={getImageUrl(preview.poster_path, 'w300')}
                alt={preview.title || preview.name}
                className="w-32 rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{preview.title || preview.name}</h3>
                <p className="text-gray-400 text-sm mb-2">
                  {preview.release_date || preview.first_air_date}
                </p>
                <p className="text-sm line-clamp-3">{preview.overview}</p>
              </div>
            </div>

            <button
              onClick={handleImport}
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Importing...' : 'Import to Database'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TMDBImport;
