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
    <div>
      <h1>{platform.name}</h1>
      <section className="section">
        <h2 className="section-title">Movies</h2>
        <div className="grid">
          {movies.map((movie) => (
            <PosterCard key={movie.id} item={movie} type="movie" />
          ))}
        </div>
      </section>
    </div>
  );
};

export default PlatformDetail;
