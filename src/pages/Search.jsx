import { useState } from 'react';
import { searchAll } from '../services/supabase';
import PosterCard from '../components/PosterCard';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ movies: [], series: [], persons: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const data = await searchAll(query);
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">Search</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, series, or people..."
              className="flex-1 px-6 py-3 bg-white/10 rounded-lg border border-white/20 focus:outline-none focus:border-red-600"
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Results */}
        {results.movies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.movies.map((movie) => (
                <PosterCard key={movie.id} item={movie} type="movie" />
              ))}
            </div>
          </div>
        )}

        {results.series.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">TV Series</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.series.map((item) => (
                <PosterCard key={item.id} item={item} type="series" />
              ))}
            </div>
          </div>
        )}

        {results.persons.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">People</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.persons.map((person) => (
                <div
                  key={person.id}
                  onClick={() => navigate(`/person/${person.id}`)}
                  className="cursor-pointer hover:scale-105 transition"
                >
                  <img
                    src={person.profile_url || 'https://via.placeholder.com/300x450'}
                    alt={person.name}
                    className="w-full h-64 object-cover rounded-xl mb-2"
                  />
                  <p className="font-semibold text-center">{person.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && query && results.movies.length === 0 && results.series.length === 0 && results.persons.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            No results found for "{query}"
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
