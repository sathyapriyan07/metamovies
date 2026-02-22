import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPlatformById, getMoviesByPlatform } from '../services/supabase';
import PosterCard from '../components/PosterCard';

const PlatformDetail = () => {
  const { id } = useParams();
  const [platform, setPlatform] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlatform();
  }, [id]);

  const loadPlatform = async () => {
    setLoading(true);
    const [{ data: platformData }, { data: moviesData }] = await Promise.all([
      getPlatformById(id),
      getMoviesByPlatform(id, 60, 0)
    ]);
    setPlatform(platformData);
    setMovies(moviesData || []);
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;
  if (!platform) return <p>Platform not found</p>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-10">
        <div className="flex flex-col items-center text-center gap-3">
          {platform.logo_url ? (
            <img loading="lazy" src={platform.logo_url} alt={platform.name} className="h-14 object-contain" />
          ) : (
            <div className="w-14 h-14 rounded-md bg-[#1a1a1a] border border-gray-800 flex items-center justify-center text-sm">
              {platform.name?.[0] || 'P'}
            </div>
          )}
          <h1 className="text-lg font-semibold">{platform.name}</h1>
          {platform.description && <p className="text-sm text-gray-400">{platform.description}</p>}
        </div>

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Available Movies</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {movies.map((movie) => (
              <PosterCard key={movie.id} item={movie} type="movie" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PlatformDetail;
