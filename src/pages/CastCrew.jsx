import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById } from '../services/supabase';

const CastCrew = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovie();
  }, [id]);

  const loadMovie = async () => {
    setLoading(true);
    const { data } = await getMovieById(id);
    setMovie(data);
    setLoading(false);
  };

  const groupCrewByJob = (crew) => {
    const groups = {};
    crew?.forEach((member) => {
      const job = member.job || 'Other';
      if (!groups[job]) groups[job] = [];
      groups[job].push(member);
    });
    return groups;
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  if (!movie) return <div style={{ padding: 20 }}>Movie not found</div>;

  const crewGroups = groupCrewByJob(movie.crew);

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => navigate(-1)}>Back</button>
      <h1>{movie.title} | Cast and Crew</h1>

      {movie.cast?.length > 0 && (
        <section>
          <h2>Cast</h2>
          <ul>
            {movie.cast.map((c) => (
              <li key={c.id}>
                <button onClick={() => navigate(`/person/${c.person.id}`)}>
                  {c.person.name} {c.character ? `- ${c.character}` : ''}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {Object.keys(crewGroups).length > 0 && (
        <section>
          <h2>Crew</h2>
          {Object.entries(crewGroups).map(([job, members]) => (
            <div key={job}>
              <h3>{job}</h3>
              <ul>
                {members.map((member) => (
                  <li key={member.id}>
                    <button onClick={() => navigate(`/person/${member.person.id}`)}>
                      {member.person.name} {member.job ? `- ${member.job}` : ''}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default CastCrew;
