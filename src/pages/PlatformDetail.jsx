import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PosterCard from '../components/PosterCard';
import { SkeletonGrid } from '../components/SkeletonLoader';
import { getMoviesByPlatform, getPlatformById } from '../services/supabase';

const PAGE_SIZE = 20;

const PlatformDetail = () => {
  const { id } = useParams();
  const [platform, setPlatform] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      const [{ data: platformData }, { data: movieData }] = await Promise.all([
        getPlatformById(id),
        getMoviesByPlatform(id, PAGE_SIZE, 0)
      ]);

      setPlatform(platformData || null);
      setMovies(movieData || []);
      setHasMore((movieData || []).length === PAGE_SIZE);
      setPage(0);
      setLoading(false);
    };

    loadInitial();
  }, [id]);

  const loadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    const { data } = await getMoviesByPlatform(id, PAGE_SIZE, nextPage * PAGE_SIZE);
    const nextMovies = data || [];
    setMovies((prev) => [...prev, ...nextMovies]);
    setHasMore(nextMovies.length === PAGE_SIZE);
    setPage(nextPage);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12">
        <div className="max-w-[1320px] mx-auto px-4 md:px-8">
          <SkeletonGrid count={12} />
        </div>
      </div>
    );
  }

  if (!platform) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        Platform not found
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 md:pt-28 pb-24 md:pb-12">
      <div className="max-w-[1320px] mx-auto px-4 md:px-8">
        <div className="glass-card rounded-3xl p-6 md:p-8 mb-8 flex items-center gap-4 md:gap-6">
          {platform.logo_url ? (
            <img
              src={platform.logo_url}
              alt={platform.name}
              loading="lazy"
              className="h-12 md:h-16 w-auto object-contain"
            />
          ) : (
            <div className="h-12 md:h-16 flex items-center text-xl font-semibold">{platform.name}</div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{platform.name}</h1>
            <p className="text-sm text-gray-400 capitalize">{platform.type}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <PosterCard key={movie.id} item={movie} type="movie" />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="btn-primary"
            >
              {loadingMore ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformDetail;
