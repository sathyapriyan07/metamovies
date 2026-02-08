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

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">TMDB Import</h1>

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

        <div className="glass-dark p-6 rounded-xl mb-6">
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
