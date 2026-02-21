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
    <div>
      <section className="section" style={{ marginTop: 0 }}>
        <div className="person-hero">
          <div className="person-hero-image">
            <img src={person.profile_url || 'https://via.placeholder.com/800x800'} alt={person.name} />
          </div>
          <div>
            <h1>{person.name}</h1>
            {person.known_for_department && <p>{person.known_for_department}</p>}
          </div>
        </div>
      </section>

      {person.biography && (
        <section className="section">
          <h2 className="section-title">Biography</h2>
          <p>
            {showFullBio ? person.biography : person.biography.slice(0, 300)}
            {person.biography.length > 300 && !showFullBio ? '...' : ''}
          </p>
          {person.biography.length > 300 && (
            <button className="button-secondary" onClick={() => setShowFullBio(!showFullBio)} style={{ marginTop: 8 }}>
              {showFullBio ? 'Show Less' : 'More'}
            </button>
          )}
        </section>
      )}

      <section className="section">
        <h2 className="section-title">Filmography</h2>
        <div className="grid">
          {movieCredits.map((credit, i) => (
            <PosterCard key={i} item={credit} type="movie" />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Featured Videos</h2>
        {videosLoading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {featuredVideos.map((video) => (
              <li key={video.id}>
                <button className="button-secondary" onClick={() => navigate(`/videos/${video.id}`)}>{video.title}</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default PersonDetail;
