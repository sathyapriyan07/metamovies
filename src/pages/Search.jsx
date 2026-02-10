import { useState, useEffect, useMemo } from 'react';
import { searchAll, getTrendingMovies, getTrendingSeries, getMovies, getSeries } from '../services/supabase';
import PosterCard from '../components/PosterCard';
import CarouselRow from '../components/CarouselRow';
import { useNavigate, useLocation } from 'react-router-dom';

const Search = () => {
  const location = useLocation();
  const [query, setQuery] = useState(location.state?.q || '');
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

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
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
      ...results.series.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title,
        type: 'series'
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
    <div className="min-h-screen pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-24 md:pt-28 page-fade">
        <div className="glass-dark py-4 px-4 md:px-6 rounded-2xl border border-white/10 mb-8">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search movies, shows, people"
              className="w-full pl-12 pr-6 py-3 glass-input"
            />
          </div>
          {query && suggestions.length > 0 && (
            <div className="mt-4 grid md:grid-cols-2 gap-2">
              {suggestions.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => navigate(item.type === 'person' ? `/person/${item.id}` : `/${item.type}/${item.id}`)}
                  className="text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/10"
                >
                  <p className="text-sm text-gray-200">{item.title}</p>
                  <span className="text-xs text-sky-300 uppercase tracking-[0.25em]">{item.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {!query ? (
          <div>
            <CarouselRow title="Trending" items={trendingMovies} type="movie" loading={homeLoading} />
            <CarouselRow title="Popular Movies" items={popularMovies} type="movie" loading={homeLoading} />
            <CarouselRow title="Popular Series" items={popularSeries} type="series" loading={homeLoading} />
            <CarouselRow title="Trending Series" items={trendingSeries} type="series" loading={homeLoading} />
          </div>
        ) : (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-sky-400 mx-auto"></div>
              </div>
            ) : (
              <>
                {results.movies.length > 0 && (
                  <div className="mb-12">
                    <h2 className="section-title">Movies</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {results.movies.map((movie) => (
                        <PosterCard key={movie.id} item={movie} type="movie" showQuickActions />
                      ))}
                    </div>
                  </div>
                )}

                {results.series.length > 0 && (
                  <div className="mb-12">
                    <h2 className="section-title">Series</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {results.series.map((item) => (
                        <PosterCard key={item.id} item={item} type="series" showQuickActions />
                      ))}
                    </div>
                  </div>
                )}

                {results.persons.length > 0 && (
                  <div className="mb-12">
                    <h2 className="section-title">People</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {results.persons.map((person) => (
                        <div
                          key={person.id}
                          onClick={() => navigate(`/person/${person.id}`)}
                          className="cursor-pointer hover:scale-105 transition"
                        >
                          <img
                            src={person.profile_url || 'https://via.placeholder.com/300x450'}
                            alt={person.name}
                            className="w-full aspect-[2/3] object-cover rounded-2xl mb-2 border border-white/10"
                            loading="lazy"
                          />
                          <p className="font-semibold text-sm text-center text-gray-100">{person.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {results.movies.length === 0 && results.series.length === 0 && results.persons.length === 0 && (
                  <div className="text-center text-gray-400 py-16 glass-card rounded-2xl">
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
