import { useState, useEffect, useMemo } from 'react';
import { searchAll, getTrendingMovies, getMovies } from '../services/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import PosterCard from '../components/PosterCard';

const Search = () => {
  const location = useLocation();
  const [query, setQuery] = useState(location.state?.q || '');
  const [results, setResults] = useState({ movies: [], persons: [] });
  const [loading, setLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const navigate = useNavigate();

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
    const [trending, movies] = await Promise.all([
      getTrendingMovies(),
      getMovies(20, 0),
    ]);
    setTrendingMovies(trending.data || []);
    setPopularMovies(movies.data || []);
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

    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const suggestions = useMemo(() => {
    if (!query) return [];
    const list = [
      ...results.movies.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        type: 'movie'
      })),
      ...results.persons.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.name,
        type: 'person'
      }))
    ];
    return list.slice(0, 6);
  }, [query, results]);

  return (
    <div>
      <h1>Search</h1>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search movies and people"
        className="search-input"
        style={{ marginTop: 12, marginBottom: 12, width: '100%' }}
      />
      {query && suggestions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p>Suggestions</p>
          <ul>
            {suggestions.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <button className="button-secondary" onClick={() => navigate(item.type === 'person' ? `/person/${item.id}` : `/${item.type}/${item.id}`)}>
                  {item.title} ({item.type})
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!query ? (
        <div>
          <section className="section">
            <h2 className="section-title">Trending</h2>
            {homeLoading ? <p>Loading...</p> : (
              <div className="grid">
                {trendingMovies.map((movie) => (
                  <PosterCard key={movie.id} item={movie} type="movie" />
                ))}
              </div>
            )}
          </section>
          <section className="section">
            <h2 className="section-title">Popular Movies</h2>
            {homeLoading ? <p>Loading...</p> : (
              <div className="grid">
                {popularMovies.map((movie) => (
                  <PosterCard key={movie.id} item={movie} type="movie" />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {results.movies.length > 0 && (
                <section className="section">
                  <h2 className="section-title">Movies</h2>
                  <div className="grid">
                    {results.movies.map((movie) => (
                      <PosterCard key={movie.id} item={movie} type="movie" />
                    ))}
                  </div>
                </section>
              )}

              {results.persons.length > 0 && (
                <section className="section">
                  <h2 className="section-title">People</h2>
                  <ul>
                    {results.persons.map((person) => (
                      <li key={person.id}>
                        <button className="button-secondary" onClick={() => navigate(`/person/${person.id}`)}>{person.name}</button>
                      </li>
                    ))}
                  </ul>
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
  );
};

export default Search;
