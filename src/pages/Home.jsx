import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTrendingMovies,
  getCollections,
  getCollectionWithItems
} from '../services/supabase';
import PosterCard from '../components/PosterCard';

const Home = () => {
  const navigate = useNavigate();
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [trending, cols] = await Promise.all([
      getTrendingMovies(),
      getCollections()
    ]);

    setTrendingMovies(trending.data || []);

    const collectionsWithItems = await Promise.all(
      (cols.data || []).map(async (col) => {
        const { data } = await getCollectionWithItems(col.id);
        return {
          ...col,
          items:
            data?.collection_items?.map((item) => ({
              ...(item.movie || {}),
              type: 'movie'
            })) || []
        };
      })
    );
    setCollections(collectionsWithItems);
    setLoading(false);
  };

  const hero = trendingMovies[0];
  const formatRuntime = (mins) => {
    if (!mins || mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([^&?/]{11})/i);
    return match ? match[1] : null;
  };
  const isVideoFile = (url) => /\.(mp4|webm|ogg|m3u8)(\?|#|$)/i.test(url || '');

  return (
    <div>
      {hero && (
        <section className="home-hero">
          {hero.trailer_url ? (
            (() => {
              const yt = getYouTubeId(hero.trailer_url);
              if (yt) {
                return (
                  <iframe
                    className="home-hero-media"
                    src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt}&playsinline=1&modestbranding=1&rel=0`}
                    title={`${hero.title} trailer`}
                    allow="autoplay; encrypted-media; fullscreen"
                    frameBorder="0"
                  />
                );
              }
              if (isVideoFile(hero.trailer_url)) {
                return (
                  <video className="home-hero-media" src={hero.trailer_url} autoPlay muted loop playsInline />
                );
              }
              return <img className="home-hero-media" src={hero.backdrop_url || hero.poster_url} alt={hero.title} />;
            })()
          ) : (
            <img className="home-hero-media" src={hero.backdrop_url || hero.poster_url} alt={hero.title} />
          )}
          <div className="hero-content">
            {hero.poster_url && <img className="hero-poster" src={hero.poster_url} alt={hero.title} />}
            {hero.title_logo_url ? (
              <img className="hero-title-logo" src={hero.title_logo_url} alt={hero.title} />
            ) : (
              <h1 className="hero-title-text">{hero.title}</h1>
            )}
            <div className="hero-meta">
              {hero.release_date?.split('-')[0]}
              {hero.runtime ? (
                <>
                  <span className="meta-sep" aria-hidden="true">
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                      <circle cx="3" cy="3" r="3" />
                    </svg>
                  </span>
                  {formatRuntime(hero.runtime)}
                </>
              ) : null}
              {hero.genres?.length ? (
                <>
                  <span className="meta-sep" aria-hidden="true">
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                      <circle cx="3" cy="3" r="3" />
                    </svg>
                  </span>
                  {hero.genres.join(' • ')}
                </>
              ) : null}
            </div>
            {hero.overview && <p className="hero-description">{hero.overview}</p>}
            <div className="hero-buttons">
              <button className="btn-primary">Watch Trailer</button>
              <button className="btn-secondary" onClick={() => navigate(`/movie/${hero.id}`)}>Details</button>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Streaming Now</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="poster-row">
            {trendingMovies.map((movie) => (
              <PosterCard key={movie.id} item={movie} type="movie" />
            ))}
          </div>
        )}
      </section>

      {collections.map((collection) => (
        <section key={collection.id} className="section">
          <h2 className="section-title">{collection.name}</h2>
          <div className="poster-row">
            {collection.items.map((item) => (
              <PosterCard key={item.id} item={item} type={item.type || 'movie'} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Home;
