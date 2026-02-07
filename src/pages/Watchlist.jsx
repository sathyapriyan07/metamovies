import { useWatchlist } from '../hooks/useWatchlist';
import PosterCard from '../components/PosterCard';
import { SkeletonRow } from '../components/SkeletonCard';

const Watchlist = () => {
  const { watchlist, loading } = useWatchlist();

  const movies = watchlist.filter(item => item.movie).map(item => item.movie);
  const series = watchlist.filter(item => item.series).map(item => item.series);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">My Watchlist</h1>
          <SkeletonRow count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8">My Watchlist</h1>

        {watchlist.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p className="text-xl">Your watchlist is empty</p>
            <p className="mt-2">Start adding movies and series to your watchlist!</p>
          </div>
        ) : (
          <>
            {movies.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Movies</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {movies.map((movie) => (
                    <PosterCard key={movie.id} item={movie} type="movie" />
                  ))}
                </div>
              </div>
            )}

            {series.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">TV Series</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {series.map((item) => (
                    <PosterCard key={item.id} item={item} type="series" />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
