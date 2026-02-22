import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getTrendingMovies,
  getCollections,
  getCollectionWithItems
} from '../services/supabase';

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
    <div className="pt-16 pb-20 min-h-screen bg-black text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {hero && (
          <section className="relative w-full h-[75vh] sm:h-[85vh] overflow-hidden">
            {hero.trailer_url ? (
              (() => {
                const yt = getYouTubeId(hero.trailer_url);
                if (yt) {
                  return (
                    <iframe
                      className="absolute inset-0 w-full h-full object-cover"
                      src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&controls=0&loop=1&playlist=${yt}&playsinline=1&modestbranding=1&rel=0`}
                      title={`${hero.title} trailer`}
                      allow="autoplay; encrypted-media; fullscreen"
                      frameBorder="0"
                    />
                  );
                }
                if (isVideoFile(hero.trailer_url)) {
                  return (
                    <video className="absolute inset-0 w-full h-full object-cover" src={hero.trailer_url} autoPlay muted loop playsInline />
                  );
                }
                return <img className="absolute inset-0 w-full h-full object-cover" src={hero.backdrop_url || hero.poster_url} alt={hero.title} />;
              })()
            ) : (
              <img className="absolute inset-0 w-full h-full object-cover" src={hero.backdrop_url || hero.poster_url} alt={hero.title} />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

            <div className="relative z-10 h-full flex flex-col justify-end px-4 pb-10">
              {hero.title_logo_url ? (
                <img className="max-w-[260px] w-full mb-4" src={hero.title_logo_url} alt={hero.title} />
              ) : (
                <h1 className="text-3xl sm:text-5xl font-semibold mb-4">{hero.title}</h1>
              )}
              <div className="text-sm text-gray-300 flex flex-wrap items-center gap-2">
                <span>{hero.release_date?.split('-')[0]}</span>
                {hero.runtime ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gray-400" aria-hidden="true" />
                    <span>{formatRuntime(hero.runtime)}</span>
                  </>
                ) : null}
                {hero.genres?.length ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-gray-400" aria-hidden="true" />
                    <span>{hero.genres.join(' • ')}</span>
                  </>
                ) : null}
              </div>
              {hero.overview && (
                <p className="mt-3 max-w-2xl text-sm sm:text-base text-gray-300">
                  {hero.overview}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium">Watch Trailer</button>
                <button className="px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium" onClick={() => navigate(`/movie/${hero.id}`)}>Details</button>
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <h2 className="section-title">Streaming Now</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {trendingMovies.map((movie) => (
                <div key={movie.id} className="min-w-[140px] sm:min-w-[180px]">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
                    <img
                      src={movie.poster_url || movie.backdrop_url}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2 text-sm truncate">{movie.title}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {collections.map((collection) => (
          <section key={collection.id} className="section">
            <h2 className="section-title">{collection.name}</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {collection.items.map((item) => (
                <div key={item.id} className="min-w-[140px] sm:min-w-[180px]">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5">
                    <img
                      src={item.poster_url || item.backdrop_url}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="mt-2 text-sm truncate">{item.title || item.name}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Home;
