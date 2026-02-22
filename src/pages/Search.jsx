import { useState, useEffect, useRef } from 'react';
import { searchAll, getTrendingMovies, getMovies, getPersons } from '../services/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import PosterCard from '../components/PosterCard';

const Search = () => {
  const location = useLocation();
  const [query, setQuery] = useState(location.state?.q || '');
  const [results, setResults] = useState({ movies: [], persons: [] });
  const [loading, setLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingPeople, setTrendingPeople] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    loadHomeContent();
  }, []);

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, []);

  const loadHomeContent = async () => {
    setHomeLoading(true);
    const [trending, movies, people] = await Promise.all([
      getTrendingMovies(),
      getMovies(20, 0),
      getPersons(12),
    ]);
    setTrendingMovies(trending.data || []);
    setPopularMovies(movies.data || []);
    setTrendingPeople(people.data || []);
    setHomeLoading(false);
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ movies: [], persons: [] });
      return;
    }

    setLoading(true);
    const data = await searchAll(searchQuery);
    setResults(data);
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pb-10">
        <div className="px-4 pt-4">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search movies and people"
            className="w-full h-12 bg-[#1a1a1a] border border-gray-800 rounded-md px-4 text-sm text-white placeholder:text-gray-500"
          />
          {query && (results.movies.length > 0 || results.persons.length > 0) && (
            <div className="mt-2 bg-[#1a1a1a] border border-gray-800 rounded-md p-3 space-y-3">
              {results.movies.slice(0, 4).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Movies</p>
                  <div className="space-y-2">
                    {results.movies.slice(0, 4).map((item) => (
                      <button
                        key={`movie-${item.id}`}
                        className="w-full flex items-center gap-3 text-left"
                        onClick={() => navigate(`/movie/${item.id}`)}
                      >
                        <img loading="lazy"
                          src={item.poster_url || item.backdrop_url}
                          alt={item.title}
                          className="w-10 h-14 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.release_date?.split('-')[0]}</p>
                        </div>
                        <span className="text-xs text-gray-400">Movie</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {results.persons.slice(0, 4).length > 0 && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">People</p>
                  <div className="space-y-2">
                    {results.persons.slice(0, 4).map((item) => (
                      <button
                        key={`person-${item.id}`}
                        className="w-full flex items-center gap-3 text-left"
                        onClick={() => navigate(`/person/${item.id}`)}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs">
                          {item.name?.[0] || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-gray-400">Actor</p>
                        </div>
                        <span className="text-xs text-gray-400">Person</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!query ? (
          <div className="mt-6 space-y-6">
            <section>
              <h2 className="text-lg font-semibold mb-3">Popular Searches</h2>
              {homeLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {popularMovies.slice(0, 6).map((movie) => (
                    <button
                      key={movie.id}
                      className="text-left"
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    >
                      <div className="aspect-[2/3] rounded-md overflow-hidden bg-[#1a1a1a]">
                        <img
                          src={movie.poster_url || movie.backdrop_url}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <p className="mt-2 text-sm font-medium truncate">{movie.title}</p>
                      <p className="text-xs text-gray-400">{movie.release_date?.split('-')[0]}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Trending Movies</h2>
              {homeLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {trendingMovies.slice(0, 6).map((movie) => (
                    <button
                      key={movie.id}
                      className="text-left"
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    >
                      <div className="aspect-[2/3] rounded-md overflow-hidden bg-[#1a1a1a]">
                        <img
                          src={movie.poster_url || movie.backdrop_url}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <p className="mt-2 text-sm font-medium truncate">{movie.title}</p>
                      <p className="text-xs text-gray-400">{movie.release_date?.split('-')[0]}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold mb-3">Trending People</h2>
              {homeLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-2">
                  {trendingPeople.slice(0, 6).map((person) => (
                    <button
                      key={person.id}
                      className="w-full flex items-center gap-3 text-left bg-[#1a1a1a] rounded-md p-3 border border-gray-800"
                      onClick={() => navigate(`/person/${person.id}`)}
                    >
                      {person.profile_url ? (
                        <img loading="lazy" src={person.profile_url} alt={person.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs">
                          {person.name?.[0] || '?'}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{person.name}</p>
                        <p className="text-xs text-gray-400">{person.known_for_department || 'Person'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="mt-6">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                {results.movies.length > 0 && (
                  <section className="py-6">
                    <h2 className="text-lg font-semibold mb-3">Movies</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {results.movies.map((movie) => (
                        <PosterCard key={movie.id} item={movie} type="movie" />
                      ))}
                    </div>
                  </section>
                )}

                {results.persons.length > 0 && (
                  <section className="py-6">
                    <h2 className="text-lg font-semibold mb-3">People</h2>
                    <div className="space-y-2">
                      {results.persons.map((person) => (
                        <button
                          key={person.id}
                          className="w-full flex items-center gap-3 text-left bg-[#1a1a1a] rounded-md p-3"
                          onClick={() => navigate(`/person/${person.id}`)}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs">
                            {person.name?.[0] || '?'}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{person.name}</p>
                            <p className="text-xs text-gray-400">Person</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {results.movies.length === 0 && results.persons.length === 0 && (
                  <p>No results found for "{query}"</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

};

export default Search;
