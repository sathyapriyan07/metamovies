import { useEffect, useState } from 'react';
import { useWatchlist } from '../hooks/useWatchlist';
import PosterCard from '../components/PosterCard';

const Watchlist = () => {
  const { watchlist, loading, removeItem } = useWatchlist();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const movies = watchlist.filter((item) => item.movie).map((item) => item.movie);
    setItems(movies);
  }, [watchlist]);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>My Watchlist</h1>
      {watchlist.length === 0 ? (
        <p>Your watchlist is empty</p>
      ) : items.length === 0 ? (
        <p>Nothing here yet</p>
      ) : (
        <section className="section">
          <h2 className="section-title">Movies</h2>
          <div className="grid">
            {items.map((item) => (
              <div key={item.id}>
                <PosterCard item={item} type="movie" />
                <button onClick={() => removeItem(item.id, 'movie')} className="button" style={{ marginTop: 8 }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Watchlist;
