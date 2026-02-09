import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSeries } from '../services/supabase';
import PosterCard from '../components/PosterCard';
import { SkeletonRow } from '../components/SkeletonCard';

const Series = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'All');

  const genres = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Thriller', 'Sci-Fi', 'Fantasy', 'Animation'];

  useEffect(() => {
    setPage(0);
    loadSeries(true);
  }, [selectedGenre]);

  useEffect(() => {
    if (page > 0) loadSeries();
  }, [page]);

  const loadSeries = async (reset = false) => {
    setLoading(true);
    const { data } = await getSeries(20, reset ? 0 : page * 20);
    if (data) {
      let filtered = data;
      if (selectedGenre !== 'All') {
        filtered = data.filter(s => s.genres?.includes(selectedGenre));
      }
      setSeries(prev => reset ? filtered : [...prev, ...filtered]);
      setHasMore(data.length === 20);
    }
    setLoading(false);
  };

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    if (genre === 'All') {
      searchParams.delete('genre');
    } else {
      searchParams.set('genre', genre);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6">TV Series</h1>
        
        {/* Genre Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 shadow-lg ${
                selectedGenre === genre
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-red-600/50'
                  : 'glass glass-hover'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
        
        {loading && page === 0 ? (
          <SkeletonRow count={10} />
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {series.map((item) => (
                <PosterCard key={item.id} item={item} type="series" />
              ))}
            </div>
            
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Series;
