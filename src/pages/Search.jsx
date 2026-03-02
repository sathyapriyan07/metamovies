import { useState, useEffect, useRef } from 'react';
import { searchAllContent, getTrendingMovies, getMovies, getPersons, getSeries, recordSearchEvent } from '../services/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import PosterCard from '../components/PosterCard';

const Search = () => {
  const location = useLocation();
  const [query, setQuery] = useState(location.state?.q || '');
  const [results, setResults] = useState({ movies: [], persons: [], series: [] });
  const [loading, setLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [trendingPeople, setTrendingPeople] = useState([]);
  const [latestSeries, setLatestSeries] = useState([]);
  const [tab, setTab] = useState('all');
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
    const [trending, movies, people, series] = await Promise.all([
      getTrendingMovies(),
      getMovies(20, 0),
      getPersons(12),
      getSeries(12, 0),
    ]);
    setTrendingMovies(trending.data || []);
    setPopularMovies(movies.data || []);
    setTrendingPeople(people.data || []);
    setLatestSeries(series.data || []);
    setHomeLoading(false);
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ movies: [], persons: [], series: [] });
      return;
    }

    setLoading(true);
    const data = await searchAllContent(searchQuery);
    setResults(data);
    if (searchQuery.trim().length >= 2) {
      await recordSearchEvent(searchQuery.trim());
    }
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
    <div className="min-h-screen bg-black overflow-x-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search Input */}
        <div className="space-y-4">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search movies, series and people"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-500 transition"
          />

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {['all', 'movies', 'series', 'people'].map((t) => (
              <button
                key={t}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                  tab === t
                    ? 'bg-yellow-500 text-black'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
                onClick={() => setTab(t)}
              >
                {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Quick Results Dropdown */}
          {query && (results.movies.length > 0 || results.persons.length > 0 || results.series.length > 0) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-4">
              {results.series.slice(0, 4).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 font-semibold">Series</p>
                  <div className="space-y-2">
                    {results.series.slice(0, 4).map((item) => (
                      <button
                        key={`series-${item.id}`}
                        className="w-full flex items-center gap-3 text-left p-2 rounded-xl hover:bg-zinc-800 transition"
                        onClick={() => navigate(`/series/${item.id}`)}
                      >
                        <img
                          loading="lazy"
                          src={item.poster_url || item.backdrop_url}
                          alt={item.name}
                          className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">{item.name}</p>
                          <p className="text-xs text-zinc-500">{item.first_air_date?.split('-')[0]}</p>
                        </div>
                        <span className="text-xs text-zinc-500 flex-shrink-0">Series</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.movies.slice(0, 4).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 font-semibold">Movies</p>
                  <div className="space-y-2">
                    {results.movies.slice(0, 4).map((item) => (
                      <button
                        key={`movie-${item.id}`}
                        className="w-full flex items-center gap-3 text-left p-2 rounded-xl hover:bg-zinc-800 transition"
                        onClick={() => navigate(`/movie/${item.id}`)}
                      >
                        <img
                          loading="lazy"
                          src={item.poster_url || item.backdrop_url}
                          alt={item.title}
                          className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">{item.title}</p>
                          <p className="text-xs text-zinc-500">{item.release_date?.split('-')[0]}</p>
                        </div>
                        <span className="text-xs text-zinc-500 flex-shrink-0">Movie</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.persons.slice(0, 4).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 font-semibold">People</p>
                  <div className="space-y-2">
                    {results.persons.slice(0, 4).map((item) => (
                      <button
                        key={`person-${item.id}`}
                        className="w-full flex items-center gap-3 text-left p-2 rounded-xl hover:bg-zinc-800 transition"
                        onClick={() => navigate(`/person/${item.id}`)}
                      >
                        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs flex-shrink-0">
                          {item.name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">{item.name}</p>
                          <p className="text-xs text-zinc-500">Actor</p>
                        </div>
                        <span className="text-xs text-zinc-500 flex-shrink-0">Person</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {!query ? (
          <div className="space-y-6">
            {/* Popular Searches */}
            <section className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white">Popular Searches</h2>
              {homeLoading ? (
                <p className="text-zinc-400 text-sm">Loading...</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {popularMovies.slice(0, 6).map((movie) => (
                    <PosterCard key={movie.id} item={movie} type="movie" />
                  ))}
                </div>
              )}
            </section>

            {/* Trending Movies */}
            {tab !== 'series' && (
              <section className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Trending Movies</h2>
                {homeLoading ? (
                  <p className="text-zinc-400 text-sm">Loading...</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {trendingMovies.slice(0, 6).map((movie) => (
                      <PosterCard key={movie.id} item={movie} type="movie" />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Latest Series */}
            {tab !== 'movies' && (
              <section className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Latest Series</h2>
                {homeLoading ? (
                  <p className="text-zinc-400 text-sm">Loading...</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {latestSeries.slice(0, 6).map((series) => (
                      <PosterCard key={series.id} item={series} type="series" />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Trending People */}
            {tab !== 'series' && (
              <section className="space-y-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Trending People</h2>
                {homeLoading ? (
                  <p className="text-zinc-400 text-sm">Loading...</p>
                ) : (
                  <div className="space-y-2">
                    {trendingPeople.slice(0, 6).map((person) => (
                      <button
                        key={person.id}
                        className="w-full flex items-center gap-3 text-left bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition"
                        onClick={() => navigate(`/person/${person.id}`)}
                      >
                        {person.profile_url ? (
                          <img
                            loading="lazy"
                            src={person.profile_url}
                            alt={person.name}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-sm flex-shrink-0">
                            {person.name?.[0] || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{person.name}</p>
                          <p className="text-xs text-zinc-500">{person.known_for_department || 'Person'}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {loading ? (
              <p className="text-zinc-400 text-sm">Loading...</p>
            ) : (
              <>
                {/* Series Results */}
                {results.series.length > 0 && (tab === 'all' || tab === 'series') && (
                  <section className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">Series</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {results.series.map((series) => (
                        <PosterCard key={series.id} item={series} type="series" />
                      ))}
                    </div>
                  </section>
                )}

                {/* Movies Results */}
                {results.movies.length > 0 && (tab === 'all' || tab === 'movies') && (
                  <section className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">Movies</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {results.movies.map((movie) => (
                        <PosterCard key={movie.id} item={movie} type="movie" />
                      ))}
                    </div>
                  </section>
                )}

                {/* People Results */}
                {results.persons.length > 0 && (tab === 'all' || tab === 'people') && (
                  <section className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">People</h2>
                    <div className="space-y-2">
                      {results.persons.map((person) => (
                        <button
                          key={person.id}
                          className="w-full flex items-center gap-3 text-left bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition"
                          onClick={() => navigate(`/person/${person.id}`)}
                        >
                          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-sm flex-shrink-0">
                            {person.name?.[0] || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{person.name}</p>
                            <p className="text-xs text-zinc-500">Person</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* No Results */}
                {results.movies.length === 0 && results.persons.length === 0 && results.series.length === 0 && (
                  <p className="text-zinc-400 text-sm">No results found for "{query}"</p>
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
