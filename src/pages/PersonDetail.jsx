import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPersonById, getFeaturedVideosByPerson } from '../services/supabase';
import PosterCard from '../components/PosterCard';

const PersonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    loadPerson();
  }, [id]);

  const loadPerson = async () => {
    setLoading(true);
    setVideosLoading(true);
    const [{ data }, { data: videos }] = await Promise.all([
      getPersonById(id),
      getFeaturedVideosByPerson(id, 8)
    ]);
    setPerson(data);
    setFeaturedVideos(videos || []);
    setLoading(false);
    setVideosLoading(false);
  };

  const movieCredits = useMemo(() => {
    if (!person) return [];
    return [
      ...(person.cast_roles?.filter((c) => c.movie)?.map((c) => ({
        ...(c.movie || {}),
        type: 'movie',
        role: c.character,
        year: c.movie?.release_date?.split('-')[0]
      })) || []),
      ...(person.crew_roles?.filter((c) => c.movie)?.map((c) => ({
        ...(c.movie || {}),
        type: 'movie',
        role: c.job,
        year: c.movie?.release_date?.split('-')[0]
      })) || [])
    ].sort((a, b) => (b.year || '0').localeCompare(a.year || '0'));
  }, [person]);

  if (loading) return <p>Loading...</p>;
  if (!person) return <p>Person not found</p>;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-10">
        <section className="flex flex-col items-center text-center gap-3">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1a1a1a]">
            <img loading="lazy" src={person.profile_url || 'https://via.placeholder.com/800x800'} alt={person.name} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold">{person.name}</h1>
          {person.known_for_department && <p className="text-sm text-gray-400">{person.known_for_department}</p>}
          {(person.birthday || person.place_of_birth) && (
            <p className="text-sm text-gray-400">
              {person.birthday || ''}{person.birthday && person.place_of_birth ? ' ? ' : ''}{person.place_of_birth || ''}
            </p>
          )}
        </section>

        {person.biography && (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Biography</h2>
            <p className="text-sm text-gray-300">
              {showFullBio ? person.biography : person.biography.slice(0, 300)}
              {person.biography.length > 300 && !showFullBio ? '...' : ''}
            </p>
            {person.biography.length > 300 && (
              <button className="mt-2 text-sm text-gray-400 hover:text-white transition" onClick={() => setShowFullBio(!showFullBio)}>
                {showFullBio ? 'Read Less' : 'Read More'}
              </button>
            )}
          </section>
        )}

        {movieCredits.length > 0 && (
          <section className="py-6">
            <h2 className="text-lg font-semibold mb-3">Known For</h2>
            <div className="flex gap-3 overflow-x-auto">
              {movieCredits.slice(0, 10).map((credit, i) => (
                <div key={`known-${i}`} className="min-w-[120px]" onClick={() => navigate(`/movie/${credit.id}`)}>
                  <div className="aspect-[2/3] rounded-md overflow-hidden bg-[#1a1a1a]">
                    <img src={credit.poster_url || credit.backdrop_url} alt={credit.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <p className="mt-2 text-sm font-medium truncate">{credit.title}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Filmography</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {movieCredits.map((credit, i) => (
              <PosterCard key={i} item={credit} type="movie" />
            ))}
          </div>
        </section>

        <section className="py-6">
          <h2 className="text-lg font-semibold mb-3">Featured Videos</h2>
          {videosLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2">
              {featuredVideos.map((video) => (
                <button key={video.id} className="w-full text-left bg-[#1a1a1a] rounded-md p-3" onClick={() => navigate(`/videos/${video.id}`)}>
                  <p className="text-sm font-medium">{video.title}</p>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );

};

export default PersonDetail;
