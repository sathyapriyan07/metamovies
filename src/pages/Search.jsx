import { useState, useEffect } from 'react';
import { searchAll, getTrendingMovies, getTrendingSeries, getMovies, getSeries } from '../services/supabase';
import PosterCard from '../components/PosterCard';
import PosterRow from '../components/PosterRow';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ movies: [], series: [], persons: [] });
  const [loading, setLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [homeLoading, setHomeLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHomeContent();
  }, []);

  const loadHomeContent = async () => {
    setHomeLoading(true);
    const [trending, series, movies, allSeries] = await Promise.all([
      getTrendingMovies(),
      getTrendingSeries(),
      getMovies(20, 0),
      getSeries(20, 0)
    ]);
    setTrendingMovies(trending.data || []);
    setTrendingSeries(series.data || []);
    setPopularMovies(movies.data || []);
    setPopularSeries(allSeries.data || []);
    setHomeLoading(false);
  };

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults({ movies: [], series: [], persons: [] });
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
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20 md:pt-24">
        {/* Search Bar */}
        <div className="sticky top-16 md:top-20 z-40 glass-dark py-4 -mx-4 md:-mx-8 px-4 md:px-8 mb-8 shadow-2xl">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Movies, shows and more"
              className="w-full pl-12 pr-6 py-3 glass-input"
            />
          </div>
        </div>

        {/* Content */}
        {!query ? (
          // Home Style Sections
          <div>
            <PosterRow title="Trending in India" items={trendingMovies} type="movie" loading={homeLoading} />
            <PosterRow title="Popular Movies" items={popularMovies} type="movie" loading={homeLoading} />
            <PosterRow title="Popular Series" items={popularSeries} type="series" loading={homeLoading} />
            <PosterRow title="Trending Series" items={trendingSeries} type="series" loading={homeLoading} />
          </div>
        ) : (
          // Search Results Grid
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600 mx-auto"></div>
              </div>
            ) : (
              <>
                {results.movies.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Movies</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {results.movies.map((movie) => (
                        <PosterCard key={movie.id} item={movie} type="movie" />
                      ))}
                    </div>
                  </div>
                )}

                {results.series.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">TV Series</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {results.series.map((item) => (
                        <PosterCard key={item.id} item={item} type="series" />
                      ))}
                    </div>
                  </div>
                )}

                {results.persons.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">People</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                      {results.persons.map((person) => (
                        <div
                          key={person.id}
                          onClick={() => navigate(`/person/${person.id}`)}
                          className="cursor-pointer hover:scale-105 transition"
                        >
                          <img
                            src={person.profile_url || 'https://via.placeholder.com/300x450'}
                            alt={person.name}
                            className="w-full aspect-[2/3] object-cover rounded-2xl mb-2"
                            loading="lazy"
                          />
                          <p className="font-semibold text-sm text-center">{person.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.movies.length === 0 && results.series.length === 0 && results.persons.length === 0 && (
                  <div className="text-center text-gray-400 py-20">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-xl">No results found for "{query}"</p>
                  </div>
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
