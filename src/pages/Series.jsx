import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSeries } from '../services/supabase';
import PosterCard from '../components/PosterCard';
import { SkeletonRow } from '../components/SkeletonLoader';

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
        filtered = data.filter((m) => m.genres?.includes(selectedGenre));
      }
      setSeries((prev) => (reset ? filtered : [...prev, ...filtered]));
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
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12 page-fade">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-8">
          <p className="text-sky-300 text-xs uppercase tracking-[0.3em]">Explore</p>
          <h1 className="text-3xl md:text-5xl font-semibold mt-2">Series</h1>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreClick(genre)}
              className={`chip ${selectedGenre === genre ? 'chip-active' : ''}`}
            >
              {genre}
            </button>
          ))}
        </div>

        {loading && page === 0 ? (
          <SkeletonRow count={10} />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {series.map((item) => (
                <PosterCard key={item.id} item={item} type="series" />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => setPage((p) => p + 1)}
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
